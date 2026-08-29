import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { staffSchema } from "~/lib/validations";
import { z } from "zod";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

const idParamSchema = z.object({
  id: z.coerce.string().min(1),
});

const patchStaffSchema = z.object({
  isActive: z.boolean(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limiter = getRateLimit("api");
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown") as string;
    const result = limiter.check(ip);
    if (!result.success) {
      throw new ApiError(429, "تعداد درخواست‌های بیش از حد", "RATE_LIMIT_EXCEEDED");
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const idValidation = idParamSchema.safeParse(resolvedParams);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
    }

    const staff = await db.staff.findUnique({
      where: { id: idValidation.data.id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!staff) {
      return NextResponse.json(
        { error: "پرسنل یافت نشد" },
        { status: 404 }
      );
    }

    logger.info("Staff fetched successfully", {  staffId: staff.id  });
    return NextResponse.json(staff);
  } catch (error) {
    logger.error("API error in staff/[id] route", { error, route: "staff/[id]", method: "GET" });
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 403 }
      );
    }

    const limiter = getRateLimit("admin");
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown") as string;
    const result = limiter.check(ip);
    if (!result.success) {
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
    const validationResult = staffSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const existingStaff = await db.staff.findUnique({
      where: { id: idValidation.data.id }
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: "پرسنل یافت نشد" },
        { status: 404 }
      );
    }

    const { name, email, phone, specialty, bio, branchId } = validationResult.data;

    const staff = await db.staff.update({
      where: { id: idValidation.data.id },
      data: {
        name,
        email,
        phone,
        specialty,
        bio,
        branchId,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    logger.info("Staff updated successfully", {  staffId: staff.id  });
    return NextResponse.json(staff);
  } catch (error) {
    logger.error("API error in staff/[id] route", { error, route: "staff/[id]", method: "PUT" });
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 403 }
      );
    }

    const limiter = getRateLimit("admin");
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown") as string;
    const result = limiter.check(ip);
    if (!result.success) {
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

    await db.staff.delete({
      where: { id: idValidation.data.id }
    });

    logger.info("Staff deleted successfully", {  staffId: idValidation.data.id  });
    return NextResponse.json({ message: "پرسنل با موفقیت حذف شد" });
  } catch (error) {
    logger.error("API error in staff/[id] route", { error, route: "staff/[id]", method: "DELETE" });
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 403 }
      );
    }

    const limiter = getRateLimit("admin");
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown") as string;
    const result = limiter.check(ip);
    if (!result.success) {
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
    const validationResult = patchStaffSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { isActive } = validationResult.data;

    const staff = await db.staff.update({
      where: { id: idValidation.data.id },
      data: { isActive },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    logger.info("Staff status updated successfully", {  staffId: staff.id, isActive  });
    return NextResponse.json(staff);
  } catch (error) {
    logger.error("API error in staff/[id] route", { error, route: "staff/[id]", method: "PATCH" });
    return handleApiError(error);
  }
}
