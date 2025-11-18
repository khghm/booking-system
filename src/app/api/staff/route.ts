/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/api/staff/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log('Staff API called');
    
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    console.log('Branch ID from query:', branchId);

    if (!branchId) {
      return NextResponse.json(
        { error: "شناسه شعبه ضروری است" },
        { status: 400 }
      );
    }

    // بررسی وجود شعبه
    const branchExists = await db.branch.findUnique({
      where: { id: branchId }
    });

    if (!branchExists) {
      return NextResponse.json(
        { error: "شعبه مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    const staff = await db.staff.findMany({
      where: { 
        branchId,
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        bio: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('Staff found:', staff.length, 'for branch:', branchId);

    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Error in staff API:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { error: "خطا در دریافت پرسنل: " + error.message },
      { status: 500 }
    );
  }
}