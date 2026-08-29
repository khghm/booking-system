// src/lib/notifications.ts
export interface AppointmentReminderData {
  user: {
    email: string;
    phone?: string;
    name?: string;
  };
  service: {
    name: string;
    duration: number;
    price?: number;
  };
  date: Date;
}

export class NotificationService {
  async sendAppointmentReminder(appointment: AppointmentReminderData): Promise<void> {
    console.log(`[NotificationService] Would send reminder for ${appointment.service.name}`);
  }

  async sendAppointmentConfirmation(appointment: AppointmentReminderData): Promise<void> {
    console.log(`[NotificationService] Would send confirmation for ${appointment.service.name}`);
  }

  async sendCancellationNotice(appointment: AppointmentReminderData, reason: string): Promise<void> {
    console.log(`[NotificationService] Would send cancellation notice for ${appointment.service.name}`);
  }
}

export const notificationService = new NotificationService();
