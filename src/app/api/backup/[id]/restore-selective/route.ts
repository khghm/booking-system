// src/app/api/backup/[id]/restore-selective/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import fs from 'fs/promises';
import path from "path";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";
import { z } from "zod";

const idParamSchema = z.object({
  id: z.string().cuid(),
});

const tablesSchema = z.object({
  tables: z.array(z.string().min(1)).min(1, "لطفا جداول مورد نظر برای بازیابی را انتخاب کنید"),
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
    const rateResult = limiter.check(`backup-restore-selective:${session!.user.id}`);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌ها بیش از حد مجاز است");
    }

    const { id } = idValidation.data;
    const body = await request.json();
    const parsedBody = tablesSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: parsedBody.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const tables = parsedBody.data.tables;

    const backup = await db.backup.findUnique({
      where: { id }
    });

    if (backup?.status !== 'COMPLETED') {
      throw new ApiError(404, "بکاپ معتبر یافت نشد");
    }

    const backupFilePath = path.join(process.cwd(), 'backups', backup.filename);
    const fileContent = await fs.readFile(backupFilePath, 'utf8');
    const backupData: { tables: Record<string, unknown[]> } = JSON.parse(fileContent) as { tables: Record<string, unknown[]> };

    const results = [];

    for (const tableName of tables) {
      try {
        const tableData = backupData.tables?.[tableName];
        if (tableData) {
          await db.$executeRawUnsafe(`DELETE FROM ${tableName}`);

          results.push({
            table: tableName,
            status: 'SUCCESS',
            records: tableData.length
          });
        } else {
          results.push({
            table: tableName,
            status: 'NOT_FOUND',
            records: 0
          });
        }
      } catch (tableError) {
        results.push({
          table: tableName,
          status: 'FAILED',
          error: tableError instanceof Error ? tableError.message : "خطای ناشناخته",
          records: 0
        });
      }
    }

    logger.info("Selective restore completed", {  userId: session!.user.id, backupId: id, tables  });

    return NextResponse.json({
      success: true,
      message: "بازیابی انتخابی انجام شد",
      results
    });

  } catch (error) {
    return handleApiError(error);
  }
}
