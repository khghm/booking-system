// src/app/api/appointments/[id]/route.ts
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new ApiError(401, "دسترسی غیر مجاز", "UNAUTHORIZED");
    }

    const resolvedParams = await params;
    const idValidation = idParamSchema.safeParse(resolvedParams);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
    }

    const { id } = idValidation.data;

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = getRateLimit("api");
    const rateResult = limiter.check(ip);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const appointment = await db.appointment.findFirst({
      where: {
        id,
        userId: session!.user.id,
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        branch: {
          select: {
            name: true,
            address: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new ApiError(404, "نوبت مورد نظر یافت نشد", "APPOINTMENT_NOT_FOUND");
    }

    return NextResponse.json(appointment);
  } catch (error) {
    return handleApiError(error);
  }
}

const patchStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new ApiError(401, "دسترسی غیر مجاز", "UNAUTHORIZED");
    }

    const resolvedParams = await params;
    const idValidation = idParamSchema.safeParse(resolvedParams);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
    }

    const { id } = idValidation.data;
    const body = await request.json();
    const validatedBody = patchStatusSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: validatedBody.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status } = validatedBody.data;

    const existingAppointment = await db.appointment.findFirst({
      where: {
        id,
        userId: session!.user.id
      }
    });

    if (!existingAppointment) {
      throw new ApiError(404, "نوبت مورد نظر یافت نشد", "APPOINTMENT_NOT_FOUND");
    }

    if (status === 'CANCELLED' && existingAppointment.status !== 'PENDING') {
      throw new ApiError(400, "فقط نوبت‌های در انتظار تأیید قابل لغو هستند", "INVALID_STATUS");
    }

    const updatedAppointment = await db.appointment.update({
      where: { id },
      data: {
        status
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

    logger.info("نوبت بروزرسانی شد", { appointmentId: id, status, userId: session!.user.id });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    return handleApiError(error);
  }
}
