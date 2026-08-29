// src/app/api/backup/[id]/restore/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import fs from 'fs/promises';
import path from 'path';
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";
import { z } from "zod";

const idParamSchema = z.object({
  id: z.string().cuid(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      throw new ApiError(403, "دسترسی غیر مجاز");
    }

    const resolvedParams = await params;
    const idValidation = idParamSchema.safeParse(resolvedParams);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
    }

    const limiter = getRateLimit("admin");
    const rateResult = limiter.check(`backup-restore:${session!.user.id}`);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌ها بیش از حد مجاز است");
    }

    const { id } = idValidation.data;
    const backup = await db.backup.findUnique({
      where: { id },
      select: { filename: true, status: true }
    });

    if (!backup) {
      throw new ApiError(404, "بکاپ یافت نشد");
    }

    if (backup.status !== 'COMPLETED') {
      throw new ApiError(400, "بکاپ ناموفق بوده و قابل بازیابی نیست");
    }

    const backupFilePath = path.join(process.cwd(), 'backups', backup.filename);
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    try {
      await fs.access(backupFilePath);
    } catch {
      throw new ApiError(404, "فایل بکاپ یافت نشد");
    }

    logger.info("Starting restore process", {  userId: session!.user.id, backupId: id  });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRestoreBackup = `pre-restore-${timestamp}.db`;
    const preRestorePath = path.join(process.cwd(), 'backups', preRestoreBackup);

    try {
      await fs.copyFile(dbPath, preRestorePath);
      logger.debug("Pre-restore backup created");

      await fs.copyFile(backupFilePath, dbPath);
      logger.info("Restore completed successfully", {  userId: session!.user.id, backupId: id  });

      const stats = await fs.stat(preRestorePath);
      await db.backup.create({
        data: {
          filename: preRestoreBackup,
          size: stats.size,
          tables: 0,
          status: 'COMPLETED',
        },
      });

      return NextResponse.json({
        success: true,
        message: "بازیابی با موفقیت انجام شد"
      });

    } catch (copyError) {
      logger.error("Restore process failed", {  err: copyError, userId: session!.user.id  });

      try {
        await fs.copyFile(preRestorePath, dbPath);
        logger.info("Recovery from pre-restore backup completed");
      } catch (recoveryError) {
        logger.error("Recovery failed", {  err: recoveryError  });
      }

      throw new ApiError(500, "خطا در بازیابی بکاپ");
    }

  } catch (error) {
    return handleApiError(error);
  }
}
