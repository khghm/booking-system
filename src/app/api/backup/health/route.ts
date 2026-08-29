// src/app/api/backup/health/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import fs from 'fs/promises';
import path from 'path';
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      throw new ApiError(403, "دسترسی غیر مجاز");
    }

    const limiter = getRateLimit("admin");
    const rateResult = limiter.check(`backup-health:${session!.user.id}`);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌ها بیش از حد مجاز است");
    }

    const lastSuccessfulBackup = await db.backup.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' }
    });

    const backups = await db.backup.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const backupsWithHealth = await Promise.all(
      backups.map(async (backup) => {
        try {
          const filePath = path.join(process.cwd(), 'backups', backup.filename);
          await fs.access(filePath);
          const stats = await fs.stat(filePath);

          return {
            ...backup,
            healthy: true,
            fileSize: stats.size,
            lastModified: stats.mtime
          };
        } catch {
          return {
            ...backup,
            healthy: false,
            fileSize: 0,
            lastModified: null
          };
        }
      })
    );

    const totalBackups = await db.backup.count();
    const healthyBackups = backupsWithHealth.filter(b => b.healthy).length;
    const totalSize = backupsWithHealth.reduce((sum, b) => sum + b.fileSize, 0);

    const warning = lastSuccessfulBackup &&
      (Date.now() - new Date(lastSuccessfulBackup.createdAt).getTime() > 24 * 60 * 60 * 1000)
      ? 'آخرین بکاپ موفق بیش از ۲۴ ساعت گذشته ایجاد شده است'
      : null;

    logger.info("Backup health checked", {  userId: session!.user.id  });

    return NextResponse.json({
      status: healthyBackups > 0 ? 'HEALTHY' : 'CRITICAL',
      lastBackup: lastSuccessfulBackup?.createdAt ?? null,
      summary: {
        totalBackups,
        healthyBackups,
        failedBackups: totalBackups - healthyBackups,
        totalSize: formatFileSize(totalSize),
        healthPercentage: Math.round((healthyBackups / totalBackups) * 100) || 0
      },
      warning,
      recentBackups: backupsWithHealth
    });

  } catch (error) {
    return handleApiError(error);
  }
}
