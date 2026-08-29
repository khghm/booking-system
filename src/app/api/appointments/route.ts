// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { logger } from "~/lib/logger";
import { appointmentSchema, type AppointmentInput } from "~/lib/validations";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new ApiError(401, "دسترسی غیر مجاز", "UNAUTHORIZED");
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = getRateLimit("api");
    const rateResult = limiter.check(ip);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const body = (await request.json()) as AppointmentInput;
    const validatedData = appointmentSchema.parse(body);

    const service = await db.service.findUnique({
      where: { id: validatedData.serviceId }
    });

    if (!service) {
      throw new ApiError(404, "سرویس مورد نظر یافت نشد", "SERVICE_NOT_FOUND");
    }

    const branch = await db.branch.findUnique({
      where: { id: validatedData.branchId }
    });

    if (!branch) {
      throw new ApiError(404, "شعبه مورد نظر یافت نشد", "BRANCH_NOT_FOUND");
    }

    const appointmentDate = new Date(validatedData.date);
    const endDate = new Date(appointmentDate.getTime() + (service.duration ?? 60) * 60000);

    const appointment = await db.appointment.create({
      data: {
        userId: session!.user.id,
        serviceId: validatedData.serviceId,
        branchId: validatedData.branchId,
        staffId: validatedData.staffId ?? null,
        date: appointmentDate,
        endDate: endDate,
        notes: validatedData.notes ?? "",
        status: "PENDING",
      },
      include: {
        service: true,
        branch: true,
        staff: true,
      }
    });

    logger.info("نوبت با موفقیت ایجاد شد", { appointmentId: appointment.id, userId: session!.user.id });

    return NextResponse.json({
      success: true,
      appointment,
      message: "نوبت با موفقیت رزرو شد"
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
