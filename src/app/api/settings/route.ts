// src/app/api/settings/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      throw new ApiError(403, "دسترسی غیر مجاز", "FORBIDDEN");
    }

    const limiter = getRateLimit("admin");
    const rateResult = limiter.check(`settings:${session!.user.id}`);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌ها بیش از حد مجاز است", "RATE_LIMIT_EXCEEDED");
    }

    const settings = {
      general: {
        siteName: "سامانه نوبت‌دهی",
        siteUrl: "https://example.com",
        timezone: "asia/tehran",
        language: "fa",
        description: "سامانه مدیریت و رزرو نوبت آنلاین"
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        adminAlerts: true
      },
      security: {
        twoFactor: false,
        passwordPolicy: true,
        sessionTimeout: true,
        ipRestriction: false
      },
      email: {
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpUsername: "noreply@example.com",
        smtpSsl: true
      }
    };

    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      throw new ApiError(403, "دسترسی غیر مجاز", "FORBIDDEN");
    }

    const limiter = getRateLimit("admin");
    const rateResult = limiter.check(`settings-save:${session!.user.id}`);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌ها بیش از حد مجاز است", "RATE_LIMIT_EXCEEDED");
    }

    const body = (await request.json()) as Record<string, unknown>;

    logger.info("Saving settings", {  userId: session!.user.id  });

    return NextResponse.json({
      message: "تنظیمات با موفقیت ذخیره شد",
      settings: body
    });
  } catch (error) {
    return handleApiError(error);
  }
}
