// src/app/api/admin/appointments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";
import { z } from "zod";

const idParamSchema = z.object({
  id: z.string().cuid(),
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  cancellationReason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== "ADMIN") {
      throw new ApiError(403, "دسترسی غیر مجاز", "FORBIDDEN");
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = getRateLimit("admin");
    const rateResult = limiter.check(ip);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const resolvedParams = await params;
    const idValidation = idParamSchema.safeParse(resolvedParams);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedBody = statusSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: validatedBody.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id } = idValidation.data;
    const { status, cancellationReason } = validatedBody.data;

    const existingAppointment = await db.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      throw new ApiError(404, "نوبت یافت نشد", "APPOINTMENT_NOT_FOUND");
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'CONFIRMED') {
      updateData.confirmedBy = session!.user.id;
      updateData.confirmedAt = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason ?? "بدون دلیل مشخص";
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        },
        service: {
          select: {
            name: true,
          }
        },
        branch: {
          select: {
            name: true,
          }
        },
        staff: {
          select: {
            name: true,
          }
        }
      }
    });

    logger.info("وضعیت نوبت تغییر کرد", { appointmentId: id, status, adminId: session!.user.id });

    return NextResponse.json(appointment);
  } catch (error) {
    return handleApiError(error);
  }
}
