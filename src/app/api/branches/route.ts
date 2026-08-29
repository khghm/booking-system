// src/app/api/branches/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { branchSchema } from "~/lib/validations";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

export async function GET(request: Request) {
  try {
    const limiter = getRateLimit("api");
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown") as string;
    const rateResult = limiter.check(ip);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const branches = await db.branch.findMany({
      include: {
        staff: {
          where: { isActive: true },
        },
        workingHours: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    logger.info("Branches fetched successfully", {  count: branches.length  });
    return NextResponse.json(branches);
  } catch (error) {
    logger.error("Error fetching branches", { error });
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 403 }
      );
    }

    const limiter = getRateLimit("admin");
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown") as string;
    const rateResult = limiter.check(ip);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const body: unknown = await request.json();

    const validationResult = branchSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "داده‌های نامعتبر",
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { name, address, phone, email, latitude, longitude } = validationResult.data;

    const existingBranch = await db.branch.findUnique({
      where: { name }
    });

    if (existingBranch) {
      return NextResponse.json(
        { error: "شعبه‌ای با این نام قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    const branch = await db.branch.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        phone: phone?.trim() ?? null,
        email: email?.trim() ?? null,
        latitude: latitude ? parseFloat(latitude.toString()) : null,
        longitude: longitude ? parseFloat(longitude.toString()) : null,
        isActive: true,
      },
      include: {
        staff: true,
        workingHours: true,
      }
    });

    const workingHoursData = Array.from({ length: 7 }, (_, i) => ({
      branchId: branch.id,
      dayOfWeek: i,
      startTime: '09:00',
      endTime: '17:00',
      isActive: i < 5,
    }));

    await db.branchWorkingHours.createMany({
      data: workingHoursData
    });

    logger.info("Branch created successfully", {  branchId: branch.id  });
    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    logger.error("Error creating branch", { error });
    return handleApiError(error);
  }
}
