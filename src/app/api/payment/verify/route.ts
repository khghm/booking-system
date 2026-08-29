// src/app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
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
      const result = await paymentService.verifyPayment(authority);

      if (result.success) {
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/payment/success?refId=${result.refId}`
        );
      } else {
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/payment/error?error=${encodeURIComponent(result.error!)}`
        );
      }
    } else {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/payment/cancelled`
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطای.internal";
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/payment/error?error=${encodeURIComponent(message)}`
    );
  }
}
