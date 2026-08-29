// src/app/api/admin/notifications/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { z } from "zod";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { handleApiError } from "~/lib/error-handler";

const idParamSchema = z.object({
  id: z.string().cuid(),
});

const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

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

    const { id } = await params;
    const parsedId = idParamSchema.safeParse({ id });

    if (!parsedId.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = updateNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { isRead, isActive } = parsed.data;

    const limiter = getRateLimit("admin");
    const rateLimitKey = `admin-notification-update:${session!.user.id}`;
    const rateResult = limiter.check(rateLimitKey);

    if (!rateResult.success) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است" },
        { status: 429 }
      );
    }

    const notification = await db.notification.update({
      where: { id: parsedId.data.id },
      data: {
        ...(isRead !== undefined && { isRead }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(notification);
  } catch (error) {
    logger.error("Error updating notification", { error });
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

    const { id } = await params;
    const parsedId = idParamSchema.safeParse({ id });

    if (!parsedId.success) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      );
    }

    const limiter = getRateLimit("admin");
    const rateLimitKey = `admin-notification-delete:${session!.user.id}`;
    const rateResult = limiter.check(rateLimitKey);

    if (!rateResult.success) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است" },
        { status: 429 }
      );
    }

    await db.notification.delete({
      where: { id: parsedId.data.id }
    });

    return NextResponse.json({ message: "اعلان با موفقیت حذف شد" });
  } catch (error) {
    logger.error("Error deleting notification", { error });
    return handleApiError(error);
  }
}
