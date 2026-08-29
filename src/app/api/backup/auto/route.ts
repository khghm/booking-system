// src/app/api/backup/auto/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.BACKUP_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      const session = await getServerSession(authOptions);
      if ((session?.user as { role?: string })?.role !== 'ADMIN') {
        throw new ApiError(403, "دسترسی غیر مجاز");
      }
    }

    const limiter = getRateLimit("admin");
    const rateResult = limiter.check(`backup-auto:${apiKey ?? 'unknown'}`);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌ها بیش از حد مجاز است");
    }

    const body = (await request.json().catch(() => ({}))) as { type?: string };
    const type = body.type ?? 'daily';

    logger.info("Starting automated backup", {  type  });

    const backupResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/backup/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backupResponse.ok) {
      throw new ApiError(500, "خطا در ایجاد بکاپ");
    }

    const backupData = await backupResponse.json() as { data: { id: string } };

    await db.autoBackupLog.create({
      data: {
        type,
        status: 'SUCCESS',
        backupId: backupData.data.id,
        details: `بکاپ ${type} خودکار با موفقیت ایجاد شد`
      }
    });

    logger.info("Auto backup completed successfully", {  type, backupId: backupData.data.id  });

    return NextResponse.json({
      success: true,
      message: `بکاپ ${type} خودکار ایجاد شد`,
      data: backupData.data
    });

  } catch (error) {
    logger.error("Auto backup failed", {  err: error  });

    try {
      await db.autoBackupLog.create({
        data: {
          type: 'daily',
          status: 'FAILED',
          details: `خطا در ایجاد بکاپ خودکار`
        }
      });
    } catch (logError) {
      logger.error("Failed to log auto backup error", {  err: logError  });
    }

    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      throw new ApiError(403, "دسترسی غیر مجاز");
    }

    const limiter = getRateLimit("admin");
    const rateResult = limiter.check(`backup-auto-logs:${session!.user.id}`);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌ها بیش از حد مجاز است");
    }

    const logs = await db.autoBackupLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const stats = await db.autoBackupLog.groupBy({
      by: ['type', 'status'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    return NextResponse.json({ logs, stats });
  } catch (error) {
    return handleApiError(error);
  }
}
