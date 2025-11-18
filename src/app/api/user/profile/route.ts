/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/api/user/profile/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { z } from "zod";

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

    const body = await request.json();
    
    // اعتبارسنجی داده‌ها
    const validationResult = profileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, phone } = validationResult.data;

    // بروزرسانی کاربر
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پروفایل" },
      { status: 500 }
    );
  }
}