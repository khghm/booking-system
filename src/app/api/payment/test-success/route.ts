// src/app/api/payment/test-success/route.ts
import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "~/lib/payment/payment.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get('authority');

    if (!authority) {
      return NextResponse.json(
        { error: "پارامترهای ضروری ارسال نشده" },
        { status: 400 }
      );
    }

    const result = await paymentService.verifyPayment(authority);

    if (result.success) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/payment/success?refId=${result.refId}`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/payment/error?error=${encodeURIComponent(result.error || 'خطا در پرداخت')}`
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطای.internal";
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/payment/error?error=${encodeURIComponent(message)}`
    );
  }
}
