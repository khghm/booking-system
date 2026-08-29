import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { staffSchema } from "~/lib/validations";
import { z } from "zod";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { ApiError, handleApiError } from "~/lib/error-handler";

const branchIdSchema = z.object({
  branchId: z.coerce.string().min(1).optional(),
});

export async function GET(request: NextRequest) {
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
        { error: "لطفا وارد سیستم شوید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");

    const validationResult = branchIdSchema.safeParse({ branchId });
    if (branchId && !validationResult.success) {
      return NextResponse.json(
        { error: "شناسه شعبه نامعتبر است" },
        { status: 400 }
      );
    }

    if (validationResult.success && validationResult.data.branchId) {
      const staff = await db.staff.findMany({
        where: {
          branchId: validationResult.data.branchId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          specialty: true,
          image: true,
        }
      });
      
      return NextResponse.json(staff);
    }

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 403 }
      );
    }

    const allStaff = await db.staff.findMany({
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    logger.info("Staff fetched successfully", {  count: allStaff.length  });
    return NextResponse.json(allStaff);

  } catch (error) {
    logger.error("API error in staff route", { error, route: "staff" });
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
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

    const body: unknown = await request.json();
    
    const validationResult = staffSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, email, phone, specialty, bio, branchId } = validationResult.data;

    const staff = await db.staff.create({
      data: {
        name,
        email,
        phone,
        specialty,
        bio,
        branchId,
        isActive: true,
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

    logger.info("Staff created successfully", {  staffId: staff.id  });
    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    logger.error("API error in staff route", { error, route: "staff", method: "POST" });
    return handleApiError(error);
  }
}
