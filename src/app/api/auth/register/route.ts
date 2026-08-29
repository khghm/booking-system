// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { db } from "~/lib/db";
import bcrypt from "bcryptjs";
import { logger } from "~/lib/logger";
import { userSchema } from "~/lib/validations";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = getRateLimit("auth");
    const rateResult = limiter.check(ip);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const body: unknown = await request.json();
    const validationResult = userSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = validationResult.data;

    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "کاربری با این ایمیل قبلاً ثبت‌نام کرده است" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "USER",
      }
    });

    logger.info("User registered successfully", {  userId: user.id, email  });
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
