// src/lib/payment/payment.service.ts
import { ZarinpalGateway, TestZarinpalGateway, type PaymentRequest, type VerificationRequest } from './gateways/zarinpal';
import { db } from '~/lib/db';

export class PaymentService {
  private zarinpal: ZarinpalGateway;

  constructor() {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID || '';
    const isTestMode = process.env.NODE_ENV === 'development' && !merchantId;

    if (isTestMode) {
      this.zarinpal = new TestZarinpalGateway({
        merchantId: 'test',
        sandbox: true,
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/verify`,
      });
    } else {
      this.zarinpal = new ZarinpalGateway({
        merchantId,
        sandbox: process.env.NODE_ENV === 'development',
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/verify`,
      });
    }
  }

  async createInvoice(appointmentId: string) {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        user: true,
      },
    });

    if (!appointment) {
      throw new Error('نوبت یافت نشد');
    }

    const subtotal = appointment.service.price || 0;
    const tax = 0;
    const discount = 0;
    const total = subtotal + tax - discount;

    const invoice = await db.invoice.create({
      data: {
        appointmentId: appointment.id,
        invoiceNumber: this.generateInvoiceNumber(),
        items: [
          {
            name: appointment.service.name,
            description: appointment.service.description,
            quantity: 1,
            unitPrice: appointment.service.price,
            total: appointment.service.price,
          },
        ],
        subtotal,
        tax,
        discount,
        total,
        status: 'ISSUED',
      },
    });

    return invoice;
  }

  async initiatePayment(invoiceId: string, method: 'ZARINPAL' | 'WALLET' | 'CASH') {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        appointment: {
          include: {
            user: true,
            service: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('فاکتور یافت نشد');
    }

    if (method === 'CASH') {
      const payment = await db.payment.create({
        data: {
          appointmentId: invoice.appointmentId,
          amount: invoice.total,
          status: 'COMPLETED',
          paymentMethod: 'CASH',
          gateway: 'ZARINPAL',
          description: 'پرداخت نقدی',
          verified: true,
        },
      });

      await db.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID' },
      });

      await db.appointment.update({
        where: { id: invoice.appointmentId },
        data: { status: 'CONFIRMED' },
      });

      return { success: true, payment };
    }

    if (method === 'ZARINPAL') {
      const paymentRequest: PaymentRequest = {
        amount: invoice.total,
        description: `پرداخت بابت نوبت ${invoice.appointment.service.name}`,
        email: invoice.appointment.user.email,
        mobile: invoice.appointment.user.phone ?? undefined,
        metadata: {
          invoiceId: invoice.id,
          appointmentId: invoice.appointmentId,
        },
      };

      const paymentResult = await this.zarinpal.createPayment(paymentRequest);

      if (paymentResult.success && paymentResult.authority) {
        const payment = await db.payment.create({
          data: {
            appointmentId: invoice.appointmentId,
            amount: invoice.total,
            status: 'PENDING',
            paymentMethod: 'ZARINPAL',
            gateway: 'ZARINPAL',
            authority: paymentResult.authority,
            description: paymentRequest.description,
            redirectUrl: paymentResult.paymentUrl,
          },
        });

        return {
          success: true,
          payment,
          redirectUrl: paymentResult.paymentUrl,
        };
      } else {
        throw new Error(paymentResult.error || 'خطا در ایجاد درگاه پرداخت');
      }
    }

    throw new Error('روش پرداخت پشتیبانی نمی‌شود');
  }

  async verifyPayment(authority: string) {
    const payment = await db.payment.findFirst({
      where: { authority },
      include: {
        appointment: {
          include: {
            invoices: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error('پرداخت یافت نشد');
    }

    if (payment.verified) {
      return { success: true, payment, message: 'پرداخت قبلاً تأیید شده است' };
    }

    const verificationRequest: VerificationRequest = {
      authority: payment.authority || '',
      amount: payment.amount,
    };

    const verificationResult = await this.zarinpal.verifyPayment(verificationRequest);

    if (verificationResult.success) {
      const updatedPayment = await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          gatewayRef: verificationResult.refId,
          verified: true,
        },
        include: {
          appointment: {
            include: {
              invoices: true,
            },
          },
        },
      });

      const invoices = await db.invoice.findMany({
        where: { appointmentId: payment.appointmentId },
        take: 1,
      });
      if (invoices.length > 0) {
        await db.invoice.update({
          where: { id: invoices[0]!.id },
          data: { status: 'PAID' },
        });
      }

      await db.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' },
      });

      return {
        success: true,
        payment: updatedPayment,
        refId: verificationResult.refId,
      };
    } else {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
        },
      });

      return {
        success: false,
        error: verificationResult.error,
        payment,
      };
    }
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }
}

export const paymentService = new PaymentService();
