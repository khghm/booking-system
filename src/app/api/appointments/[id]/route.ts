/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/api/appointments/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // بررسی وجود نوبت و مالکیت
    const existingAppointment = await db.appointment.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "نوبت مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    // فقط اجازه لغو نوبت‌های pending
    if (body.status === 'CANCELLED' && existingAppointment.status !== 'PENDING') {
      return NextResponse.json(
        { error: "فقط نوبت‌های در انتظار تأیید قابل لغو هستند" },
        { status: 400 }
      );
    }

    // بروزرسانی نوبت
    const updatedAppointment = await db.appointment.update({
      where: { id },
      data: {
        status: body.status
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی نوبت" },
      { status: 500 }
    );
  }
}