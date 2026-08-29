/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/notification-service.ts
import { db } from "./db";
import type { NotificationType, RelatedType, NotificationPriority } from "@prisma/client";

export class NotificationService {
  // ایجاد اعلان جدید
  async createNotification(data: {
    type: NotificationType;
    title: string;
    message: string;
    userId?: string;
    relatedId?: string;
    relatedType?: RelatedType;
    priority?: NotificationPriority;
  }) {
    try {
      const notification = await db.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          userId: data.userId ?? null,
          relatedId: data.relatedId ?? null,
          relatedType: data.relatedType ?? null,
          priority: data.priority ?? 'MEDIUM',
          isActive: true,
          isRead: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      // ارسال نوتیفیکیشن Real-time (اگر لازم باشد)
      await this.sendRealTimeNotification(notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // ارسال اعلان Real-time
  private async sendRealTimeNotification(notification: any) {
    // اینجا می‌توانید از WebSocket یا Pusher و غیره استفاده کنید
    // برای نمونه، فقط لاگ می‌کنیم
    console.log('Real-time notification:', notification);
  }

  // ایجاد اعلان برای نوبت جدید
  async createAppointmentNotification(appointment: any) {
    return this.createNotification({
      type: 'NEW_APPOINTMENT',
      title: 'نوبت جدید ثبت شد',
      message: `نوبت جدید برای سرویس ${appointment.service.name} در تاریخ ${new Date(appointment.date).toLocaleDateString('fa-IR')} ثبت شد`,
      userId: appointment.userId,
      relatedId: appointment.id,
      relatedType: 'APPOINTMENT',
      priority: 'MEDIUM',
    });
  }

  // ایجاد اعلان تأیید نوبت
  async createAppointmentConfirmationNotification(appointment: any) {
    return this.createNotification({
      type: 'APPOINTMENT_CONFIRMED',
      title: 'نوبت تأیید شد',
      message: `نوبت شما برای ${appointment.service.name} تأیید شد`,
      userId: appointment.userId,
      relatedId: appointment.id,
      relatedType: 'APPOINTMENT',
      priority: 'MEDIUM',
    });
  }

  // ایجاد اعلان لغو نوبت
  async createAppointmentCancellationNotification(appointment: any, reason: string) {
    return this.createNotification({
      type: 'APPOINTMENT_CANCELLED',
      title: 'نوبت لغو شد',
      message: `نوبت شما برای ${appointment.service.name} لغو شد. دلیل: ${reason}`,
      userId: appointment.userId,
      relatedId: appointment.id,
      relatedType: 'APPOINTMENT',
      priority: 'HIGH',
    });
  }

  // ایجاد اعلان یادآوری نوبت
  async createAppointmentReminderNotification(appointment: any, _hoursBefore = 24) {
    return this.createNotification({
      type: 'APPOINTMENT_REMINDER',
      title: 'یادآوری نوبت',
      message: `یادآوری: نوبت شما برای فردا ساعت ${new Date(appointment.date).toLocaleTimeString('fa-IR')} می‌باشد`,
      userId: appointment.userId,
      relatedId: appointment.id,
      relatedType: 'APPOINTMENT',
      priority: 'MEDIUM',
    });
  }

  // ایجاد اعلان سیستم
  async createSystemNotification(title: string, message: string, priority: NotificationPriority = 'MEDIUM') {
    return this.createNotification({
      type: 'SYSTEM_ALERT',
      title,
      message,
      priority,
    });
  }

  // ایجاد اعلان امنیتی
  async createSecurityNotification(userId: string, title: string, message: string) {
    return this.createNotification({
      type: 'SECURITY_ALERT',
      title,
      message,
      userId,
      priority: 'HIGH',
    });
  }

  // دریافت اعلان‌های کاربر
  async getUserNotifications(userId: string, options: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    isActive?: boolean;
  } = {}) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { userId: null }, // اعلان‌های عمومی
        { userId }, // اعلان‌های اختصاصی کاربر
      ],
    };

    if (options.isRead !== undefined) {
      where.isRead = options.isRead;
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // علامت‌گذاری اعلان به عنوان خوانده شده
  async markAsRead(notificationId: string) {
    return db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // علامت‌گذاری همه اعلان‌های کاربر به عنوان خوانده شده
  async markAllAsRead(userId: string) {
    return db.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  // حذف اعلان
  async deleteNotification(notificationId: string) {
    return db.notification.delete({
      where: { id: notificationId },
    });
  }

  // غیرفعال کردن اعلان
  async deactivateNotification(notificationId: string) {
    return db.notification.update({
      where: { id: notificationId },
      data: { isActive: false },
    });
  }

  // دریافت آمار اعلان‌ها
  async getNotificationStats(userId?: string) {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }

    const [total, unread, urgent, today] = await Promise.all([
      db.notification.count({ where }),
      db.notification.count({ 
        where: { ...where, isRead: false } 
      }),
      db.notification.count({
        where: { ...where, priority: 'URGENT' }
      }),
      db.notification.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
    ]);

    const byType = await db.notification.groupBy({
      by: ['type'],
      _count: {
        id: true
      },
      where,
    });

    return {
      total,
      unread,
      urgent,
      today,
      byType,
    };
  }
}

export const notificationService = new NotificationService();