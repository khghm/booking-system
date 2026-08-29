// src/app/api/services/route.ts
import { NextResponse } from "next/server";
import { db } from "~/lib/db";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = getRateLimit("api");
    const rateResult = limiter.check(ip);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    logger.info("Services fetched successfully", {  count: services.length  });
    return NextResponse.json(services);
  } catch (error) {
    return handleApiError(error);
  }
}
