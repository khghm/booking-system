// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { z } from "zod";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { handleApiError } from "~/lib/error-handler";

const notificationQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.coerce.number().int().min(1).max(50)).default("5"),
  unreadOnly: z.string().transform(Boolean).default("false"),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = notificationQuerySchema.safeParse({
      limit: searchParams.get('limit'),
      unreadOnly: searchParams.get('unreadOnly'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "پارامترهای نامعتبر", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { limit, unreadOnly } = parsed.data;

    const limiter = getRateLimit("api");
    const rateLimitKey = `notifications:${session!.user.id}`;
    const rateResult = limiter.check(rateLimitKey);

    if (!rateResult.success) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است" },
        { status: 429 }
      );
    }

    const where: { OR: ({ userId: string } | { userId: undefined })[]; isActive: boolean; isRead?: boolean } = {
      OR: [
        { userId: session!.user.id },
        { userId: undefined }
      ],
      isActive: true
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),

      db.notification.count({
        where: { ...where, isRead: false }
      })
    ]);

    return NextResponse.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    logger.error("Error fetching notifications", { error });
    return handleApiError(error);
  }
}

const markReadSchema = z.object({
  notificationIds: z.array(z.string().cuid()).optional(),
  markAllAsRead: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = markReadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { notificationIds, markAllAsRead } = parsed.data;

    if (markAllAsRead) {
      await db.notification.updateMany({
        where: {
          OR: [
            { userId: session!.user.id },
            { userId: undefined }
          ],
          isRead: false,
          isActive: true
        },
        data: {
          isRead: true,
          updatedAt: new Date()
        }
      });
    } else if (notificationIds && notificationIds.length > 0) {
      await db.notification.updateMany({
        where: {
          id: { in: notificationIds },
          OR: [
            { userId: session!.user.id },
            { userId: undefined }
          ]
        },
        data: {
          isRead: true,
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error updating notifications", { error });
    return handleApiError(error);
  }
}
