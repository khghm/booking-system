// src/app/api/appointments/slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { logger } from "~/lib/logger";
import { z } from "zod";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

const slotQuerySchema = z.object({
  date: z.string().datetime("تاریخ معتبر نیست"),
  serviceId: z.string().min(1, "سرویس معتبر نیست"),
  branchId: z.string().min(1, "شعبه معتبر نیست"),
  staffId: z.string().min(1, "پرسنل معتبر نیست").optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new ApiError(401, "دسترسی غیر مجاز", "UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = slotQuerySchema.parse({
      date: queryParams.date,
      serviceId: queryParams.serviceId,
      branchId: queryParams.branchId,
      staffId: queryParams.staffId,
    });

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = getRateLimit("api");
    const rateResult = limiter.check(ip);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const selectedDate = new Date(validatedQuery.date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const service = await db.service.findUnique({
      where: { id: validatedQuery.serviceId }
    });

    if (!service) {
      throw new ApiError(404, "سرویس یافت نشد", "SERVICE_NOT_FOUND");
    }

    const workingHours = await db.branchWorkingHours.findFirst({
      where: {
        branchId: validatedQuery.branchId,
        dayOfWeek: selectedDate.getDay(),
        isActive: true
      }
    });

    if (!workingHours) {
      return NextResponse.json([]);
    }

    const slots = generateTimeSlots(
      workingHours.startTime,
      workingHours.endTime,
      service.duration
    );

    const existingAppointments = await db.appointment.findMany({
      where: {
        branchId: validatedQuery.branchId,
        staffId: validatedQuery.staffId ?? undefined,
        date: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      select: {
        date: true,
        service: {
          select: {
            duration: true
          }
        }
      }
    });

    const availableSlots = slots.map(slot => {
      const slotStart = new Date(slot.time);
      const slotEnd = new Date(slotStart.getTime() + service.duration * 60000);

      const isAvailable = !existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.date);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointment.service.duration * 60000);

        return slotStart < appointmentEnd && appointmentStart < slotEnd;
      });

      return {
        time: slot.time,
        available: isAvailable
      };
    });

    logger.info("زمان‌های موجود دریافت شد", { date: validatedQuery.date, branchId: validatedQuery.branchId });

    return NextResponse.json(availableSlots);
  } catch (error) {
    return handleApiError(error);
  }
}

function generateTimeSlots(startTime: string, endTime: string, duration: number) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const start = new Date();
  start.setHours(startHour ?? 0, startMinute ?? 0, 0, 0);

  const end = new Date();
  end.setHours(endHour ?? 0, endMinute ?? 0, 0, 0);

  let current = new Date(start);

  while (current < end) {
    slots.push({
      time: current.toISOString()
    });

    current = new Date(current.getTime() + duration * 60000);
  }

  return slots;
}
