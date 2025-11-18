/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/payment/verify/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { paymentService } from "~/lib/payment/payment.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get('Authority');
    const status = searchParams.get('Status');

    if (!authority) {
      return NextResponse.json(
        { error: "پارامترهای ضروری ارسال نشده" },
        { status: 400 }
      );
    }

    if (status === 'OK') {
      // پرداخت موفق - تأیید پرداخت
      const result = await paymentService.verifyPayment(authority);

      if (result.success) {
        // ریدایرکت به صفحه موفقیت
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/payment/success?refId=${result.refId}`
        );
      } else {
        // ریدایرکت به صفحه خطا
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/payment/error?error=${encodeURIComponent(result.error!)}`
        );
      }
    } else {
      // کاربر از پرداخت انصراف داده
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/payment/cancelled`
      );
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/payment/error?error=${encodeURIComponent(error.message)}`
    );
  }
}