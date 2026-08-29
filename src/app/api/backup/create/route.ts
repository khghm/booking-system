// src/app/api/backup/create/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import fs from 'fs/promises';
import path from 'path';
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      throw new ApiError(403, "دسترسی غیر مجاز");
    }

    const limiter = getRateLimit("admin");
    const rateResult = limiter.check(`backup-create:${session!.user.id}`);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌ها بیش از حد مجاز است");
    }

    logger.info("Starting backup process", {  userId: session!.user.id  });

    const backupsDir = path.join(process.cwd(), 'backups');
    try {
      await fs.access(backupsDir);
    } catch {
      await fs.mkdir(backupsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.db`;
    const backupFilePath = path.join(backupsDir, backupFileName);

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    logger.debug("Backup paths", {  dbPath, backupFilePath  });

    try {
      await fs.access(dbPath);
      logger.debug("Database file exists");
    } catch {
      logger.error("Database file not found", {  dbPath  });
      throw new ApiError(500, "فایل دیتابیس یافت نشد");
    }

    try {
      await fs.copyFile(dbPath, backupFilePath);
      logger.debug("Database copied successfully");

      const stats = await fs.stat(backupFilePath);
      const fileSize = stats.size;

      const tablesCount = await db.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'
      `;

      const tables = Number(tablesCount[0]?.count ?? 0);

      const backupRecord = await db.backup.create({
        data: {
          filename: backupFileName,
          size: fileSize,
          tables: tables,
          status: 'COMPLETED',
        },
      });

      logger.info("Backup completed successfully", {  userId: session!.user.id, backupId: backupRecord.id  });

      const allBackups = await db.backup.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, filename: true }
      });

      if (allBackups.length > 10) {
        const backupsToDelete = allBackups.slice(10);
        for (const backup of backupsToDelete) {
          try {
            const fileToDelete = path.join(backupsDir, backup.filename);
            await fs.unlink(fileToDelete);
            await db.backup.delete({ where: { id: backup.id } });
            logger.debug("Deleted old backup", {  filename: backup.filename  });
          } catch (deleteError) {
            logger.warn("Error deleting old backup", {  err: deleteError, filename: backup.filename  });
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: backupRecord,
        message: "بکاپ با موفقیت ایجاد شد"
      });

    } catch (copyError) {
      logger.error("Backup copy failed", {  err: copyError, userId: session!.user.id  });

      await db.backup.create({
        data: {
          filename: backupFileName,
          size: 0,
          tables: 0,
          status: 'FAILED',
        },
      });

      throw new ApiError(500, "خطا در ایجاد بکاپ");
    }

  } catch (error) {
    return handleApiError(error);
  }
}
