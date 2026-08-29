// src/app/api/reports/export/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { z } from "zod";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { handleApiError } from "~/lib/error-handler";

const exportSchema = z.object({
  format: z.enum(["csv", "pdf"]),
  reportType: z.string().min(1),
  dateRange: z.string().optional(),
  data: z.object({
    summary: z.record(z.union([z.string(), z.number()])),
    details: z.array(z.record(z.unknown())),
  }),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = exportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { format, reportType, data } = parsed.data;

    const limiter = getRateLimit("admin");
    const rateLimitKey = `reports-export:${session!.user.id}`;
    const rateResult = limiter.check(rateLimitKey);

    if (!rateResult.success) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است" },
        { status: 429 }
      );
    }

    let fileContent: string;
    let contentType: string;
    let filename: string;

    if (format === 'csv') {
      fileContent = generateCSV(data, reportType);
      contentType = 'text/csv; charset=utf-8';
      filename = `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (format === 'pdf') {
      fileContent = generatePDFContent(data, reportType);
      contentType = 'application/pdf';
      filename = `report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
    } else {
      return NextResponse.json(
        { error: "فرمت فایل پشتیبانی نمی‌شود" },
        { status: 400 }
      );
    }

    const blob = new Blob([fileContent], { type: contentType });

    return new Response(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    logger.error("Error exporting report", { error });
    return handleApiError(error);
  }
}

function generateCSV(data: { summary: Record<string, string | number>; details: Record<string, unknown>[] }, reportType: string): string {
  const headers = ['عنوان', 'توضیحات', 'مقدار', 'تاریخ'];
  const rows = data.details.map((item: Record<string, unknown>) => [
    item.title ?? '',
    item.description ?? '',
    item.value ?? '',
    item.date ? new Date(item.date as string).toLocaleDateString('fa-IR') : ''
  ]);

  const summaryRows = Object.entries(data.summary).map(([key, value]) => [
    getSummaryTitle(key),
    '',
    String(value),
    ''
  ]);

  const allRows = [
    ['گزارش:', reportType],
    ['تاریخ تولید:', new Date().toLocaleDateString('fa-IR')],
    [],
    ...rows,
    [],
    ['خلاصه گزارش'],
    ...summaryRows
  ];

  const csvContent = allRows.map(row =>
    row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  return '\uFEFF' + csvContent;
}

function generatePDFContent(data: { summary: Record<string, string | number>; details: Record<string, unknown>[] }, reportType: string): string {
  const content = `
    گزارش ${reportType}
    تاریخ تولید: ${new Date().toLocaleDateString('fa-IR')}

    خلاصه:
    ${Object.entries(data.summary).map(([key, value]) =>
      `${getSummaryTitle(key)}: ${value}`
    ).join('\n    ')}

    جزئیات:
    ${data.details.map((item: Record<string, unknown>) =>
      `${item.title} - ${item.description} - ${item.value}`
    ).join('\n    ')}
  `;

  return content;
}

function getSummaryTitle(key: string): string {
  const titles: Record<string, string> = {
    totalRevenue: 'درآمد کل',
    totalAppointments: 'تعداد نوبت‌ها',
    averageRevenue: 'میانگین درآمد',
    dateRange: 'بازه زمانی',
    completedAppointments: 'نوبت‌های تکمیل شده',
    pendingAppointments: 'نوبت‌های در انتظار',
    cancellationRate: 'نرخ کنسلی',
    totalUsers: 'تعداد کاربران',
    activeUsers: 'کاربران فعال',
    conversionRate: 'نرخ تبدیل',
    totalServices: 'تعداد سرویس‌ها',
    mostPopularService: 'پرطرفدارترین سرویس'
  };

  return titles[key] ?? key;
}
