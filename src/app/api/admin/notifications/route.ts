// src/app/api/admin/notifications/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { z } from "zod";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { handleApiError } from "~/lib/error-handler";

const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.string().optional(),
  isRead: z.coerce.boolean().optional(),
  priority: z.string().optional(),
});

const createNotificationSchema = z.object({
  type: z.enum(["APPOINTMENT_REMINDER", "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "NEW_APPOINTMENT", "SYSTEM_ALERT", "SECURITY_ALERT", "PAYMENT_SUCCESS", "PAYMENT_FAILED"]),
  title: z.string().min(1),
  message: z.string().min(1),
  userId: z.string().cuid().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = notificationQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      type: searchParams.get('type'),
      isRead: searchParams.get('isRead'),
      priority: searchParams.get('priority'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "پارامترهای نامعتبر", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { page, limit, type, isRead, priority } = parsed.data;

    const limiter = getRateLimit("admin");
    const rateLimitKey = `admin-notifications:${session!.user.id}`;
    const rateResult = limiter.check(rateLimitKey);

    if (!rateResult.success) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است" },
        { status: 429 }
      );
    }

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    const [notifications, total, unreadCount, stats] = await Promise.all([
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

      db.notification.count({
        where: { ...where, isRead: false }
      }),

      db.notification.groupBy({
        by: ['type'],
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
      stats: {
        today: stats.reduce((acc, item) => acc + item._count.id, 0),
        byType: stats
      }
    });
  } catch (error) {
    logger.error("Error fetching notifications", { error });
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, title, message, userId, priority } = parsed.data;

    const notification = await db.notification.create({
      data: {
        type,
        title,
        message,
        userId: userId ?? null,
        priority,
        isActive: true,
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

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    logger.error("Error creating notification", { error });
    return handleApiError(error);
  }
}
