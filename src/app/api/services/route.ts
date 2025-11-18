/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/app/api/services/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

export async function GET() {
  try {
    console.log('=== START SERVICES API ===');
    
    await prisma.$connect();
    console.log('Database connected for services');

    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    console.log('Services found:', services);
    
    await prisma.$disconnect();
    console.log('=== END SERVICES API ===');
    
    return NextResponse.json(services);
  } catch (error: any) {
    console.error('=== SERVICES API ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===');
    
    await prisma.$disconnect().catch(() => {});
    
    return NextResponse.json(
      { 
        error: "خطا در دریافت سرویس‌ها",
        details: error.message 
      },
      { status: 500 }
    );
  }
}