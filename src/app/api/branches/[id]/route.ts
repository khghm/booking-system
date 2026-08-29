// src/app/api/branches/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { z } from "zod";
import { branchSchema } from "~/lib/validations";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

const idParamSchema = z.object({
  id: z.string().cuid(),
});

const patchBranchSchema = z.object({
  isActive: z.boolean(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limiter = getRateLimit("api");
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown") as string;
    const rateResult = limiter.check(ip);

    if (!rateResult.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const resolvedParams = await params;
    const idValidation = idParamSchema.safeParse(resolvedParams);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
    }

    const branch = await db.branch.findUnique({
      where: { id: idValidation.data.id },
      include: {
        staff: true,
        workingHours: true,
        branchServices: {
          include: {
            service: true
          }
        }
      }
    });

    if (!branch) {
      return NextResponse.json(
        { error: "شعبه یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(branch);
  } catch (error) {
    logger.error("Error fetching branch", { error });
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const idValidation = idParamSchema.safeParse(resolvedParams);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
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
      where: { id: idValidation.data.id }
    });

    if (!existingBranch) {
      return NextResponse.json(
        { error: "شعبه یافت نشد" },
        { status: 404 }
      );
    }

    const duplicateBranch = await db.branch.findFirst({
      where: {
        name,
        id: { not: idValidation.data.id }
      }
    });

    if (duplicateBranch) {
      return NextResponse.json(
        { error: "شعبه‌ای با این نام قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    const branch = await db.branch.update({
      where: { id: idValidation.data.id },
      data: {
        name: name.trim(),
        address: address.trim(),
        phone: phone?.trim() ?? null,
        email: email?.trim() ?? null,
        latitude: latitude ? parseFloat(latitude.toString()) : null,
        longitude: longitude ? parseFloat(longitude.toString()) : null,
      },
      include: {
        staff: true,
        workingHours: true,
      }
    });

    logger.info("Branch updated successfully", {  branchId: branch.id  });
    return NextResponse.json(branch);
  } catch (error) {
    logger.error("Error updating branch", { error });
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const idValidation = idParamSchema.safeParse(resolvedParams);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();
    const validationResult = patchBranchSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { isActive } = validationResult.data;

    const existingBranch = await db.branch.findUnique({
      where: { id: idValidation.data.id }
    });

    if (!existingBranch) {
      return NextResponse.json(
        { error: "شعبه یافت نشد" },
        { status: 404 }
      );
    }

    const branch = await db.branch.update({
      where: { id: idValidation.data.id },
      data: { isActive },
      include: {
        staff: true,
      }
    });

    logger.info("Branch status updated successfully", {  branchId: branch.id, isActive  });
    return NextResponse.json(branch);
  } catch (error) {
    logger.error("Error updating branch status", { error });
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const idValidation = idParamSchema.safeParse(resolvedParams);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
    }

    const existingBranch = await db.branch.findUnique({
      where: { id: idValidation.data.id },
      include: {
        staff: true,
        appointments: true
      }
    });

    if (!existingBranch) {
      return NextResponse.json(
        { error: "شعبه یافت نشد" },
        { status: 404 }
      );
    }

    if (existingBranch.staff.length > 0) {
      return NextResponse.json(
        { error: "امکان حذف شعبه دارای پرسنل وجود ندارد" },
        { status: 400 }
      );
    }

    if (existingBranch.appointments.length > 0) {
      return NextResponse.json(
        { error: "امکان حذف شعبه دارای نوبت ثبت‌شده وجود ندارد" },
        { status: 400 }
      );
    }

    await db.branchWorkingHours.deleteMany({
      where: { branchId: idValidation.data.id }
    });

    await db.branchService.deleteMany({
      where: { branchId: idValidation.data.id }
    });

    await db.branch.delete({
      where: { id: idValidation.data.id }
    });

    logger.info("Branch deleted successfully", {  branchId: idValidation.data.id  });
    return NextResponse.json({
      message: "شعبه با موفقیت حذف شد"
    });
  } catch (error) {
    logger.error("Error deleting branch", { error });
    return handleApiError(error);
  }
}
