// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { z } from "zod";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

const profileSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد').optional(),
  phone: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 401 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = getRateLimit("api");
    const rateResult = limiter.check(ip);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const body: unknown = await request.json();

    const validationResult = profileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, phone } = validationResult.data;

    const updatedUser = await db.user.update({
      where: { id: session!.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    });

    logger.info("Profile updated successfully", {  userId: updatedUser.id  });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}
