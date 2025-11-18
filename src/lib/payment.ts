/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/lib/payment.ts
export class PaymentService {
  private zarinpal: any;

  constructor() {
    this.zarinpal = require('zarinpal-checkout').create(process.env.ZARINPAL_MERCHANT_ID!, true);
  }

  async createPayment(amount: number, description: string, metadata: any) {
    try {
      const result = await this.zarinpal.PaymentRequest({
        Amount: amount,
        CallbackURL: `${process.env.NEXTAUTH_URL}/payment/verify`,
        Description: description,
        Email: metadata.email,
        Mobile: metadata.phone,
      });

      if (result.status === 100) {
        return {
          success: true,
          authority: result.authority,
          paymentUrl: result.url,
        };
      } else {
        throw new Error('خطا در ایجاد درگاه پرداخت');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      throw new Error('خطا در ارتباط با درگاه پرداخت');
    }
  }

  async verifyPayment(authority: string, amount: number) {
    try {
      const result = await this.zarinpal.PaymentVerification({
        Amount: amount,
        Authority: authority,
      });

      if (result.status === 100 || result.status === 101) {
        return {
          success: true,
          refId: result.RefID,
          status: result.status,
        };
      } else {
        return {
          success: false,
          status: result.status,
          message: 'پرداخت ناموفق بود',
        };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error('خطا در تأیید پرداخت');
    }
  }

  async createInvoice(appointment: any) {
    const invoice = {
      id: `INV-${Date.now()}`,
      appointmentId: appointment.id,
      amount: appointment.service.price,
      description: `فاکتور سرویس ${appointment.service.name}`,
      date: new Date().toISOString(),
      items: [
        {
          name: appointment.service.name,
          quantity: 1,
          unitPrice: appointment.service.price,
          total: appointment.service.price,
        },
      ],
      customer: {
        name: appointment.user.name,
        email: appointment.user.email,
        phone: appointment.user.phone,
      },
    };

    // ذخیره فاکتور در دیتابیس
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });

    return invoice;
  }
}