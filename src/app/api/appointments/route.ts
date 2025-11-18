/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// آپدیت فایل API برای لاگ کامل
// src/app/api/appointments/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";

export async function POST(request: NextRequest) {
  try {
    console.log("📨 درخواست ایجاد نوبت دریافت شد");
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log("❌ کاربر لاگین نیست");
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 401 }
      );
    }

    console.log("👤 کاربر:", session.user.id, session.user.email);
    
    const body = await request.json();
    console.log("📦 داده‌های دریافتی:", JSON.stringify(body, null, 2));

    // اعتبارسنجی ساده
    if (!body.serviceId || !body.branchId || !body.date) {
      console.log("❌ داده‌های ناقص");
      return NextResponse.json(
        { error: "داده‌های ضروری ارسال نشده" },
        { status: 400 }
      );
    }

    // بررسی وجود سرویس
    const service = await db.service.findUnique({
      where: { id: body.serviceId }
    });
    
    if (!service) {
      console.log("❌ سرویس یافت نشد:", body.serviceId);
      return NextResponse.json(
        { error: "سرویس مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی وجود شعبه
    const branch = await db.branch.findUnique({
      where: { id: body.branchId }
    });
    
    if (!branch) {
      console.log("❌ شعبه یافت نشد:", body.branchId);
      return NextResponse.json(
        { error: "شعبه مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    const appointmentDate = new Date(body.date);
    const endDate = new Date(appointmentDate.getTime() + (service.duration || 60) * 60000);

    console.log("📅 تاریخ نوبت:", appointmentDate);
    console.log("⏰ پایان نوبت:", endDate);

    // ایجاد نوبت
    const appointment = await db.appointment.create({
      data: {
        userId: session.user.id,
        serviceId: body.serviceId,
        branchId: body.branchId,
        staffId: body.staffId || null,
        date: appointmentDate,
        endDate: endDate,
        notes: body.notes || "",
        status: "PENDING",
      },
      include: {
        service: true,
        branch: true,
        staff: true,
      }
    });

    console.log("✅ نوبت با موفقیت ایجاد شد:", appointment.id);

    return NextResponse.json({
      success: true,
      appointment: appointment,
      message: "نوبت با موفقیت رزرو شد"
    }, { status: 201 });

  } catch (error: any) {
    console.error("💥 خطای کامل در ایجاد نوبت:", error);
    
    // لاگ کامل خطا
    console.error("📝 جزئیات خطا:");
    console.error("نام خطا:", error.name);
    console.error("پیام خطا:", error.message);
    console.error("کد خطا:", error.code);
    console.error("متن خطا:", error.toString());
    
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json(
      { 
        error: "خطای داخلی سرور",
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}