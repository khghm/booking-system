// src/app/api/backup/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import fs from 'fs/promises';
import path from 'path';
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      throw new ApiError(403, "دسترسی غیر مجاز");
    }

    const limiter = getRateLimit("admin");
    const rateResult = limiter.check(`backup-list:${session!.user.id}`);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌ها بیش از حد مجاز است");
    }

    const backups = await db.backup.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        size: true,
        tables: true,
        status: true,
        createdAt: true,
      }
    });

    const backupsWithFileStatus = await Promise.all(
      backups.map(async (backup) => {
        try {
          const filePath = path.join(process.cwd(), 'backups', backup.filename);
          await fs.access(filePath);
          return {
            ...backup,
            fileExists: true
          };
        } catch {
          return {
            ...backup,
            fileExists: false
          };
        }
      })
    );

    return NextResponse.json(backupsWithFileStatus);
  } catch (error) {
    logger.error("Error fetching backups", { error });
    return handleApiError(error);
  }
}
