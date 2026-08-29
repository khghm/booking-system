// src/app/api/admin/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

export async function GET(request: NextRequest) {
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

    const appointments = await db.appointment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
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
      },
      orderBy: { date: 'desc' }
    });

    logger.info("لیست نوبت‌ها دریافت شد", { count: appointments.length, adminId: session!.user.id });

    return NextResponse.json(appointments);
  } catch (error) {
    return handleApiError(error);
  }
}
