/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { db } from "~/lib/db";
import bcrypt from 'bcryptjs';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // بررسی وجود کاربر
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
    // ایجاد کاربر جدید
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "USER",
      }
    });

    // بازگرداندن اطلاعات کاربر (بدون پسورد)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    // ⬅️ گام حیاتی: لاگ کردن خطای دقیق
    console.error("Error in register:", error); 
    
    // اگر خطای Prisma است، کد خطا را برگردانید (اختیاری)
    if (error && typeof error === 'object' && 'code' in error) {
        console.error("Prisma Error Code:", error.code);
        // می‌توانید اینجا پیغام خطا را دقیق‌تر به کلاینت برگردانید
        // مثال: return NextResponse.json({ error: `Prisma Error: ${error.code}` }, { status: 500 });
    }
    return NextResponse.json(
      { error: "خطا در ایجاد حساب کاربری" },
      { status: 500 }
    );
  }
}