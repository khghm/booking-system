/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/api/payment/initiate/route.ts
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { paymentService } from "~/lib/payment/payment.service";
import { db } from '~/lib/db';
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { appointmentId, paymentMethod } = body;

    if (!appointmentId || !paymentMethod) {
      return NextResponse.json(
        { error: "پارامترهای ضروری ارسال نشده" },
        { status: 400 }
      );
    }

    // بررسی مالکیت نوبت
    const appointment = await db.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: session.user.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "نوبت یافت نشد" },
        { status: 404 }
      );
    }

    // ایجاد فاکتور
    const invoice = await paymentService.createInvoice(appointmentId);

    // شروع پرداخت
    const result = await paymentService.initiatePayment(invoice.id, paymentMethod);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || "خطا در شروع پرداخت" },
      { status: 500 }
    );
  }
}