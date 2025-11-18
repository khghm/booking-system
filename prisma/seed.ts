/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// تابع کمکی برای محاسبه تاریخ پایان نوبت
function calculateEndDate(startDate: Date, durationMinutes: number): Date {
  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + durationMinutes);
  return endDate;
}

async function main() {
  console.log('شروع seeding...')

  // --- پاک کردن داده‌های قدیمی ---
  console.log('🧹 Cleaning existing data...');
  await prisma.discountUse.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.userPoints.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.discountCode.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.branchService.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.branchWorkingHours.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.service.deleteMany();
  await prisma.loyaltyProgram.deleteMany();
  await prisma.user.deleteMany(); // آخرین مدل‌هایی که به بقیه وابسته نیستند

  // --- ایجاد کاربران ---
  console.log('👤 Creating users...');
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'مدیر سیستم',
      password: adminPassword,
      role: 'ADMIN',
      phone: '09123456789',
      emailVerified: new Date(),
    },
  })

  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'کاربر نمونه',
      password: userPassword,
      role: 'USER',
      phone: '09123456780',
      emailVerified: new Date(),
    },
  })
  
  // --- ایجاد شعب ---
  console.log('🏢 Creating branches...');
  const branches = await Promise.all([
    prisma.branch.create({
      data: {
        name: 'شعبه مرکزی',
        address: 'تهران، خیابان ولیعصر، پلاک ۱۰۰',
        phone: '021-12345678',
        email: 'central@example.com',
        latitude: 35.6892,
        longitude: 51.3890,
      },
    }),
    prisma.branch.create({
      data: {
        name: 'شعبه غرب',
        address: 'تهران، شهرک غرب، خیابان ایران زمین',
        phone: '021-87654321',
        email: 'west@example.com',
        latitude: 35.7440,
        longitude: 51.2350,
      },
    }),
    prisma.branch.create({
      data: {
        name: 'شعبه شرق',
        address: 'تهران، خیابان دماوند، نبش خیابان آهنگ',
        phone: '021-55556666',
        email: 'east@example.com',
        latitude: 35.6895,
        longitude: 51.4870,
      },
    })
  ]);

  // --- ایجاد ساعت‌کاری برای شعب (با تنوع بیشتر) ---
  console.log('⏰ Creating working hours...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // روز کاری فردا
  
  for (const branch of branches) {
    const workingHoursData = Array.from({ length: 7 }, (_, i) => ({
      branchId: branch.id,
      dayOfWeek: i,
      startTime: '09:00',
      endTime: i === 4 ? '15:00' : '17:00', // پنجشنبه‌ها تا ساعت 15:00
      isActive: i < 6, // شنبه تا پنجشنبه فعال، جمعه غیرفعال
    }))

    await prisma.branchWorkingHours.createMany({
      data: workingHoursData
    })
  }

  // --- ایجاد سرویس‌ها ---
  console.log('📦 Creating services...');
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'مشاوره تلفنی',
        description: 'مشاوره تخصصی به مدت ۳۰ دقیقه',
        duration: 30,
        price: 50000,
        color: '#3b82f6',
      },
    }),
    prisma.service.create({
      data: {
        name: 'جلسه حضوری',
        description: 'جلسه حضوری به مدت ۶۰ دقیقه',
        duration: 60,
        price: 100000,
        color: '#10b981',
      },
    }),
    prisma.service.create({
      data: {
        name: 'بررسی مدارک',
        description: 'بررسی تخصصی مدارک و اسناد',
        duration: 45,
        price: 75000,
        color: '#f59e0b',
      },
    }),
    prisma.service.create({
      data: {
        name: 'معاینه تخصصی',
        description: 'معاینه کامل و تخصصی',
        duration: 90,
        price: 150000,
        color: '#ef4444',
      },
    })
  ]);

  // --- اتصال سرویس‌ها به شعب ---
  console.log('🔗 Connecting services to branches...');
  for (const branch of branches) {
    for (const service of services) {
      await prisma.branchService.create({
        data: {
          branchId: branch.id,
          serviceId: service.id,
          isActive: true,
          price: service.price,
        },
      })
    }
  }

  // --- ایجاد پرسنل ---
  console.log('👥 Creating staff...');
  const staffMembers = await Promise.all([
    prisma.staff.create({
      data: {
        name: 'دکتر جعفری',
        email: 'dr.jafari@example.com',
        phone: '09123456781',
        specialty: 'پوست و مو',
        bio: 'متخصص پوست و مو با ۱۰ سال سابقه کاری',
        branchId: branches[0]!.id, // شعبه مرکزی
        isActive: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: 'دکتر احمدی',
        email: 'dr.ahmadi@example.com',
        phone: '09123456782',
        specialty: 'دندانپزشک',
        bio: 'دندانپزشک زیبایی با تخصص ایمپلنت',
        branchId: branches[0]!.id, // شعبه مرکزی
        isActive: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: 'دکتر محمدی',
        email: 'dr.mohammadi@example.com',
        phone: '09123456783',
        specialty: 'مشاور خانواده',
        bio: 'مشاور خانواده و روانشناس بالینی',
        branchId: branches[1]!.id, // شعبه غرب
        isActive: true,
      },
    })
  ]);
  
  // --- ایجاد برنامه وفاداری ---
  console.log('🎁 Creating loyalty program...');
  const loyaltyProgram = await prisma.loyaltyProgram.create({
    data: {
      name: 'برنامه وفاداری طلایی',
      description: 'کسب امتیاز از هر خرید و استفاده از پاداش‌های ویژه',
      pointsRate: 1.0,
      isActive: true,
    },
  })

  // --- ایجاد پاداش‌ها ---
  console.log('🏆 Creating rewards...');
  const rewardPercentage = await prisma.reward.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'تخفیف ۱۰٪',
        description: '۱۰٪ تخفیف در نوبت بعدی',
        pointsCost: 1000,
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
      },
    })
  const rewardAmount = await prisma.reward.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'نوبت رایگان',
        description: 'یک نوبت رایگان برای مشاوره تلفنی',
        pointsCost: 5000,
        discountType: 'AMOUNT',
        discountValue: 50000,
        isActive: true,
        stock: 50,
      },
    })
  
  // --- ایجاد کدهای تخفیف ---
  console.log('🎫 Creating discount codes...');
  const welcomeDiscount = await prisma.discountCode.create({
      data: {
        code: 'WELCOME100',
        description: 'تخفیف ویژه خوش آمدگویی',
        discountType: 'AMOUNT',
        discountValue: 10000,
        maxUses: 100,
        usedCount: 0,
        minAmount: 50000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 روز
        isActive: true,
      },
    })
  const summerDiscount = await prisma.discountCode.create({
      data: {
        code: 'SUMMER25',
        description: 'تخفیف تابستانه',
        discountType: 'PERCENTAGE',
        discountValue: 25,
        maxUses: 200,
        usedCount: 0,
        minAmount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 روز
        isActive: true,
      },
    })

  // ==========================================================
  // --- اضافه کردن داده‌های کلیدی عملیاتی برای تست روابط ---
  // ==========================================================
  
  // --- ۱. ایجاد یک نوبت رزرو شده (Appointment) ---
  console.log('📅 Creating a sample Appointment...');
  const appointmentDate = new Date(tomorrow.setHours(10, 0, 0, 0)); // فردا ساعت 10:00 صبح
  const serviceDuration = services[0]!.duration; // مشاوره تلفنی (30 دقیقه)
  const appointmentEndDate = calculateEndDate(appointmentDate, serviceDuration);

  const sampleAppointment = await prisma.appointment.create({
    data: {
      userId: user.id,
      serviceId: services[0]!.id, // مشاوره تلفنی
      branchId: branches[0]!.id, // شعبه مرکزی
      staffId: staffMembers[0]!.id, // دکتر جعفری
      date: appointmentDate,
      endDate: appointmentEndDate,
      status: 'CONFIRMED',
      notes: 'رزرو برای تست فرآیند نوبت‌دهی',
    },
  });

  // --- ۲. ایجاد امتیازات کاربر (UserPoints) ---
  console.log('🌟 Creating UserPoints for the sample user...');
  const userPointsRecord = await prisma.userPoints.create({
    data: {
      userId: user.id,
      programId: loyaltyProgram.id,
      points: 2500, // امتیاز اولیه
      totalEarned: 2500,
      totalSpent: 0,
    },
  });

  // --- ۳. ایجاد تراکنش امتیاز (PointTransaction) برای نوبت رزرو شده ---
  console.log('💸 Creating PointTransaction for the Appointment...');
  const earnedPoints = Math.floor(services[0]!.price! * loyaltyProgram.pointsRate / 1000); // فرضا 50 امتیاز
  await prisma.pointTransaction.create({
    data: {
      userPointsId: userPointsRecord.id,
      points: earnedPoints,
      type: 'EARN_APPOINTMENT',
      description: `کسب امتیاز بابت رزرو نوبت ${sampleAppointment.id}`,
      referenceId: sampleAppointment.id,
    },
  });

  // --- ۴. ایجاد بازخرید پاداش (Redemption) ---
  console.log('🎁 Creating a sample Redemption...');
  await prisma.redemption.create({
    data: {
      userId: user.id,
      rewardId: rewardPercentage.id, // تخفیف 10%
      pointsSpent: rewardPercentage.pointsCost, // 1000 امتیاز
      status: 'APPROVED',
    },
  });

  // --- ۵. ایجاد استفاده از تخفیف (DiscountUse) ---
  console.log('🏷️ Creating a sample DiscountUse...');
  await prisma.discountUse.create({
    data: {
      discountCodeId: summerDiscount.id,
      userId: user.id,
      appointmentId: sampleAppointment.id, // مرتبط با نوبت بالا
    },
  });
  
  // به‌روزرسانی تعداد استفاده شده کد تخفیف
  await prisma.discountCode.update({
      where: { id: summerDiscount.id },
      data: { usedCount: { increment: 1 } }
  });


  console.log('✅ Seeding completed successfully!')
  console.log('📊 Summary:')
  console.log('   👤 Admin:', admin.email)
  console.log('   👤 User:', user.email)
  console.log('   🏢 Branches:', branches.length)
  console.log('   📦 Services:', services.length)
  console.log('   👥 Staff:', staffMembers.length)
  console.log('   📅 Sample Appointment ID:', sampleAppointment.id)
  console.log('   🌟 User Points (Initial):', userPointsRecord.points, ' (Current after transaction: ', userPointsRecord.points + earnedPoints, ')')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })