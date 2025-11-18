/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/api/test-db/route.ts
import { NextResponse } from "next/server";
import { db } from "~/lib/db";

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // تست اتصال پایه
    const result = await db.$queryRaw`SELECT 1 as test`;
    console.log('Raw query result:', result);
    
    // تست مدل‌ها
    const tables = {
      services: await db.service.count(),
      branches: await db.branch.count(),
      users: await db.user.count(),
      staff: await db.staff.count()
    };
    
    console.log('Table counts:', tables);
    
    return NextResponse.json({
      success: true,
      database: 'Connected',
      tables
    });
  } catch (error: any) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}