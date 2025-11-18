/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/api/branches/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'

// استفاده از PrismaClient مستقیم برای دیباگ
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // فعال کردن لاگ
})

export async function GET() {
  try {
    console.log('=== START BRANCHES API ===');
    
    // تست اتصال پایه
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connected successfully');

    // دریافت branches
    console.log('Fetching branches...');
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    console.log('Branches found:', branches);
    
    await prisma.$disconnect();
    console.log('=== END BRANCHES API ===');
    
    return NextResponse.json(branches);
  } catch (error: any) {
    console.error('=== BRANCHES API ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===');
    
    await prisma.$disconnect().catch(() => {});
    
    return NextResponse.json(
      { 
        error: "خطا در دریافت شعب",
        details: error.message 
      },
      { status: 500 }
    );
  }
}