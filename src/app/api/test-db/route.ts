// src/app/api/test-db/route.ts
import { NextResponse } from "next/server";
import { db } from "~/lib/db";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";

export async function GET() {
  try {
    const limiter = getRateLimit("api");
    const rateResult = limiter.check("test-db:global");

    if (!rateResult.success) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است" },
        { status: 429 }
      );
    }

    const result = await db.$queryRaw`SELECT 1 as test`;

    const tables = {
      services: await db.service.count(),
      branches: await db.branch.count(),
      users: await db.user.count(),
      staff: await db.staff.count()
    };

    logger.debug("Database connection test", {  result, tables  });

    return NextResponse.json({
      success: true,
      database: 'Connected',
      tables
    });
  } catch (error) {
    logger.error("Database test failed", {  err: error  });

    const message = process.env.NODE_ENV === "production"
      ? "خطا در اتصال به دیتابیس"
      : error instanceof Error
        ? error.message
        : "خطای ناشناخته";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
