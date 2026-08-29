// src/app/api/backup/[id]/download/route.ts
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

export async function GET(
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
    const rateResult = limiter.check(`backup-download:${session!.user.id}`);

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
      throw new ApiError(400, "بکاپ ناموفق بوده و قابل دانلود نیست");
    }

    const filePath = path.join(process.cwd(), 'backups', backup.filename);

    try {
      await fs.access(filePath);
    } catch {
      throw new ApiError(404, "فایل بکاپ یافت نشد");
    }

    const fileBuffer = await fs.readFile(filePath);

    logger.info("Backup downloaded", {  userId: session!.user.id, backupId: id, filename: backup.filename  });

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${backup.filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    return handleApiError(error);
  }
}
