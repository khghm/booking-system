/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/api/appointments/slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { format, parse, isWithinInterval, addMinutes } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    const branchId = searchParams.get('branchId');
    const staffId = searchParams.get('staffId');

    if (!dateStr || !serviceId || !branchId) {
      return NextResponse.json(
        { error: "پارامترهای ضروری ارسال نشده" },
        { status: 400 }
      );
    }

    // دریافت اطلاعات سرویس
    const service = await db.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: "سرویس مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    // دریافت ساعت کاری شعبه
    const selectedDate = new Date(dateStr);
    const dayOfWeek = selectedDate.getDay(); // 0-6 (یکشنبه=0, شنبه=6)
    
    const workingHours = await db.branchWorkingHours.findFirst({
      where: {
        branchId,
        dayOfWeek,
        isActive: true
      }
    });

    if (!workingHours) {
      return NextResponse.json({ data: [] }); // شعبه در این روز تعطیل است
    }

    // تولید time slots
    const timeSlots = generateTimeSlots(
      workingHours.startTime,
      workingHours.endTime,
      service.duration
    );

    // دریافت نوبت‌های موجود برای فیلتر کردن
    const existingAppointments = await db.appointment.findMany({
      where: {
        branchId,
        ...(staffId && { staffId }),
        date: {
          gte: new Date(dateStr + 'T00:00:00'),
          lt: new Date(dateStr + 'T23:59:59')
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      select: {
        date: true,
        endDate: true
      }
    });

    // فیلتر کردن time slots بر اساس نوبت‌های موجود
    const availableSlots = timeSlots.map(slot => {
      const slotStart = parse(slot.time, 'HH:mm', selectedDate);
      const slotEnd = addMinutes(slotStart, service.duration);

      const isAvailable = !existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.date);
        const appointmentEnd = new Date(appointment.endDate);
        
        return (
          isWithinInterval(slotStart, { start: appointmentStart, end: appointmentEnd }) ||
          isWithinInterval(slotEnd, { start: appointmentStart, end: appointmentEnd }) ||
          (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
        );
      });

      return {
        time: slot.time,
        available: isAvailable
      };
    });

    return NextResponse.json({ data: availableSlots });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json(
      { error: "خطا در دریافت زمان‌های موجود" },
      { status: 500 }
    );
  }
}

function generateTimeSlots(startTime: string, endTime: string, duration: number) {
  const slots: { time: string }[] = [];
  const start = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());

  let current = start;
  
  while (current < end) {
    const next = addMinutes(current, duration);
    
    if (next <= end) {
      slots.push({
        time: format(current, 'HH:mm')
      });
    }
    
    current = addMinutes(current, 30); // فواصل ۳۰ دقیقه‌ای
  }

  return slots;
}