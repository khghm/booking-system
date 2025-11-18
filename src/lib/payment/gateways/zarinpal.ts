/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// src/lib/payment/gateways/zarinpal.ts

export interface ZarinpalConfig {
  merchantId: string;
  sandbox?: boolean;
  callbackUrl: string;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  email?: string;
  mobile?: string;
  metadata?: any;
}

export interface PaymentResponse {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  error?: string;
}

export interface VerificationRequest {
  authority: string;
  amount: number;
}

export interface VerificationResponse {
  success: boolean;
  refId?: string;
  status?: number;
  error?: string;
}

export class ZarinpalGateway {
  private config: ZarinpalConfig;
  private baseUrl: string;

  constructor(config: ZarinpalConfig) {
    this.config = config;
    this.baseUrl = config.sandbox 
      ? 'https://sandbox.zarinpal.com/pg/rest/WebGate/'
      : 'https://www.zarinpal.com/pg/rest/WebGate/';
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}PaymentRequest.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          MerchantID: this.config.merchantId,
          Amount: Math.floor(request.amount / 10), // تبدیل به ریال
          CallbackURL: this.config.callbackUrl,
          Description: request.description,
          Email: request.email,
          Mobile: request.mobile,
          Metadata: request.metadata ? [request.metadata] : undefined,
        }),
      });

      const data = await response.json();

      if (data.Status === 100) {
        const paymentUrl = this.config.sandbox
          ? `https://sandbox.zarinpal.com/pg/StartPay/${data.Authority}`
          : `https://www.zarinpal.com/pg/StartPay/${data.Authority}`;

        return {
          success: true,
          authority: data.Authority,
          paymentUrl,
        };
      } else {
        return {
          success: false,
          error: this.getErrorMessage(data.Status),
        };
      }
    } catch (error) {
      console.error('Zarinpal payment creation error:', error);
      return {
        success: false,
        error: 'خطا در ارتباط با درگاه پرداخت',
      };
    }
  }

  async verifyPayment(request: VerificationRequest): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}PaymentVerification.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          MerchantID: this.config.merchantId,
          Authority: request.authority,
          Amount: Math.floor(request.amount / 10), // تبدیل به ریال
        }),
      });

      const data = await response.json();

      if (data.Status === 100 || data.Status === 101) {
        return {
          success: true,
          refId: data.RefID,
          status: data.Status,
        };
      } else {
        return {
          success: false,
          status: data.Status,
          error: this.getErrorMessage(data.Status),
        };
      }
    } catch (error) {
      console.error('Zarinpal payment verification error:', error);
      return {
        success: false,
        error: 'خطا در تأیید پرداخت',
      };
    }
  }

  private getErrorMessage(status: number): string {
    const errors: { [key: number]: string } = {
      '-1': 'اطلاعات ارسال شده ناقص است',
      '-2': 'IP یا مرچنت کد پذیرنده صحیح نیست',
      '-3': 'با توجه به محدودیت های شاپرک امکان پرداخت با رقم درخواست شده میسر نمیباشد',
      '-4': 'سطح تایید پذیرنده پایین تر از سطح نقره ای است',
      '-11': 'درخواست مورد نظر یافت نشد',
      '-12': 'امکان ویرایش درخواست میسر نمی باشد',
      '-21': 'هیچ نوع عملیات مالی برای این تراکنش یافت نشد',
      '-22': 'تراکنش ناموفق میباشد',
      '-33': 'رقم تراکنش با رقم پرداخت شده مطابقت ندارد',
      '-34': 'سقف تقسیم تراکنش از لحاظ تعداد یا رقم عبور نموده است',
      '-40': 'اجازه دسترسی به متد مربوطه وجود ندارد',
      '-41': 'اطلاعات ارسال شده مربوط به AdditionalData غیرمعتبر می باشد',
      '-42': 'مدت زمان معتبر طول عمر شناسه پرداخت باید بین 30 دقیقه تا 45 روز باشد',
      '-54': 'درخواست مورد نظر آرشیو شده است',
      '100': 'عملیات با موفقیت انجام شد',
      '101': 'عملیات پرداخت موفق بوده و قبلا PaymentVerification تراکنش انجام شده است',
    };

    return errors[status] || 'خطای ناشناخته در درگاه پرداخت';
  }
}