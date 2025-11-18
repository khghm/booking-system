// src/lib/notifications.ts
import { Resend } from 'resend';
import sms from 'sms-ir';

export class NotificationService {
  private resend: Resend;
  private smsClient: any;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!);
    this.smsClient = new sms(process.env.SMS_API_KEY!);
  }

  async sendAppointmentReminder(appointment: any) {
    // ایمیل ۲۴ ساعته قبل
    await this.resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: appointment.user.email,
      subject: 'یادآوری نوبت - فردا',
      html: this.generateReminderEmail(appointment, '24h')
    });

    // SMS 1 ساعته قبل
    await this.smsClient.Send({
      Mobile: appointment.user.phone,
      Message: `یادآوری: نوبت شما برای ${appointment.service.name} فردا ساعت ${this.formatTime(appointment.date)} می‌باشد.`
    });
  }

  async sendAppointmentConfirmation(appointment: any) {
    await this.resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: appointment.user.email,
      subject: 'تأیید نوبت',
      html: this.generateConfirmationEmail(appointment)
    });
  }

  async sendCancellationNotice(appointment: any, reason: string) {
    await Promise.all([
      this.resend.emails.send({
        from: 'noreply@yourdomain.com',
        to: appointment.user.email,
        subject: 'لغو نوبت',
        html: this.generateCancellationEmail(appointment, reason)
      }),
      this.smsClient.Send({
        Mobile: appointment.user.phone,
        Message: `نوبت شما برای ${appointment.service.name} لغو شد. دلیل: ${reason}`
      })
    ]);
  }

  private generateReminderEmail(appointment: any, type: '24h' | '1h') {
    return `
      <div style="font-family: Tahoma; direction: rtl;">
        <h2>یادآوری نوبت</h2>
        <p>کاربر گرامی،</p>
        <p>نوبت شما برای سرویس <strong>${appointment.service.name}</strong> 
        ${type === '24h' ? 'فردا' : 'امروز'} 
        ساعت <strong>${this.formatTime(appointment.date)}</strong> 
        می‌باشد.</p>
        <div style="background: #f8f9fa; padding: 15px; margin: 10px 0;">
          <h3>مشخصات نوبت:</h3>
          <p>تاریخ: ${this.formatDate(appointment.date)}</p>
          <p>ساعت: ${this.formatTime(appointment.date)}</p>
          <p>مدت زمان: ${appointment.service.duration} دقیقه</p>
          ${appointment.service.price ? `<p>هزینه: ${appointment.service.price.toLocaleString()} تومان</p>` : ''}
        </div>
        <p>در صورت نیاز به تغییر یا لغو نوبت، از طریق پنل کاربری اقدام نمایید.</p>
      </div>
    `;
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fa-IR');
  }

  private formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}