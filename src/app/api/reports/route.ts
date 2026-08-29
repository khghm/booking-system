// src/app/api/reports/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { z } from "zod";
import { logger } from "~/lib/logger";
import { getRateLimit } from "~/lib/rate-limit";
import { handleApiError } from "~/lib/error-handler";

const reportQuerySchema = z.object({
  reportType: z.enum(["revenue", "appointments", "users", "services"]).default("appointments"),
  dateRange: z.enum(["7days", "30days", "90days", "custom"]).default("30days"),
  branchId: z.string().min(1).optional().default("all"),
  serviceId: z.string().min(1).optional().default("all"),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیر مجاز" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = reportQuerySchema.safeParse({
      reportType: searchParams.get('reportType'),
      dateRange: searchParams.get('dateRange'),
      branchId: searchParams.get('branchId'),
      serviceId: searchParams.get('serviceId'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "پارامترهای نامعتبر", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { reportType, dateRange, branchId, serviceId } = parsed.data;

    const limiter = getRateLimit("admin");
    const rateLimitKey = `reports:${session!.user.id}`;
    const rateResult = limiter.check(rateLimitKey);

    if (!rateResult.success) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است" },
        { status: 429 }
      );
    }

    logger.info("Generating report", { reportType, dateRange, branchId, serviceId });

    const startDate = calculateStartDate(dateRange);
    const endDate = new Date();

    let reportData: ReportResult;

    switch (reportType) {
      case 'revenue':
        reportData = await generateRevenueReport(startDate, endDate);
        break;
      case 'appointments':
        reportData = await generateAppointmentsReport(startDate, endDate, branchId, serviceId);
        break;
      case 'users':
        reportData = await generateUsersReport(startDate, endDate);
        break;
      case 'services':
        reportData = await generateServicesReport(startDate, endDate);
        break;
      default:
        return NextResponse.json(
          { error: "نوع گزارش نامعتبر است" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      summary: reportData.summary,
      details: reportData.details,
      chartData: reportData.chartData
    });
  } catch (error) {
    logger.error("Error generating report", { error });
    return handleApiError(error);
  }
}

function calculateStartDate(dateRange: string): Date {
  const now = new Date();

  switch (dateRange) {
    case '7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'custom':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

async function generateRevenueReport(startDate: Date, endDate: Date): Promise<ReportResult> {
  const completedAppointments = await db.appointment.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      service: {
        select: {
          price: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const revenueByDate: Record<string, number> = {};

  completedAppointments.forEach(appointment => {
    const date = appointment.createdAt.toISOString().split('T')[0] ?? '';
    const revenue = appointment.service.price || 0;

    revenueByDate[date] = (revenueByDate[date] ?? 0) + revenue;
  });

  const chartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
    date,
    revenue
  })).sort((a, b) => a.date.localeCompare(b.date));

  const totalRevenue = completedAppointments.reduce((sum, appointment) =>
    sum + (appointment.service.price || 0), 0
  );

  const averageRevenue = completedAppointments.length > 0
    ? totalRevenue / completedAppointments.length
    : 0;

  const summary: ReportSummary = {
    totalRevenue,
    totalAppointments: completedAppointments.length,
    averageRevenue: Math.round(averageRevenue),
    dateRange: `${startDate.toLocaleDateString('fa-IR')} تا ${endDate.toLocaleDateString('fa-IR')}`
  };

  const details: AppointmentData[] = chartData.map(item => ({
    title: `درآمد ${new Date(item.date).toLocaleDateString('fa-IR')}`,
    description: `تعداد نوبت: ${completedAppointments.filter(a =>
      a.createdAt.toISOString().split('T')[0] === item.date
    ).length}`,
    value: `${item.revenue.toLocaleString()} تومان`,
    date: item.date
  }));

  return {
    summary,
    details,
    chartData: chartData.map(item => ({
      month: new Date(item.date).toLocaleDateString('fa-IR', { month: 'long' }),
      درآمد: item.revenue
    }))
  };
}

async function generateAppointmentsReport(startDate: Date, endDate: Date, branchId: string, serviceId: string): Promise<ReportResult> {
  const whereClause: Record<string, unknown> = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  if (branchId !== 'all') {
    whereClause.branchId = branchId;
  }

  if (serviceId !== 'all') {
    whereClause.serviceId = serviceId;
  }

  const appointments = await db.appointment.findMany({
    where: whereClause,
    include: {
      service: {
        select: {
          name: true,
          price: true
        }
      },
      branch: {
        select: {
          name: true
        }
      },
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const appointmentsByDate: Record<string, number> = {};

  appointments.forEach(appointment => {
    const date = appointment.createdAt.toISOString().split('T')[0] ?? '';
    appointmentsByDate[date] = (appointmentsByDate[date] ?? 0) + 1;
  });

  const chartData = Object.entries(appointmentsByDate).map(([date, count]) => ({
    date,
    count
  })).sort((a, b) => a.date.localeCompare(b.date));

  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;
  const cancellationRate = appointments.length > 0
    ? Math.round((cancelledCount / appointments.length) * 100)
    : 0;

  const summary: ReportSummary = {
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter(a => a.status === 'COMPLETED').length,
    pendingAppointments: appointments.filter(a => a.status === 'PENDING').length,
    cancellationRate,
    dateRange: `${startDate.toLocaleDateString('fa-IR')} تا ${endDate.toLocaleDateString('fa-IR')}`
  };

  const details: AppointmentData[] = appointments.slice(0, 20).map(appointment => ({
    title: `نوبت ${appointment.service.name}`,
    description: `کاربر: ${appointment.user?.name || 'نامشخص'} - شعبه: ${appointment.branch.name}`,
    value: getStatusText(appointment.status),
    date: appointment.createdAt.toISOString()
  }));

  return {
    summary,
    details,
    chartData: chartData.map(item => ({
      month: new Date(item.date).toLocaleDateString('fa-IR', { month: 'long' }),
      نوبت‌ها: item.count
    }))
  };
}

async function generateUsersReport(startDate: Date, endDate: Date): Promise<ReportResult> {
  const users = await db.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      role: 'USER'
    },
    include: {
      appointments: {
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const activeUsers = users.filter(user =>
    user.appointments.length > 0
  ).length;

  const usersByDate: Record<string, number> = {};

  users.forEach(user => {
    const date = user.createdAt.toISOString().split('T')[0] ?? '';
    usersByDate[date] = (usersByDate[date] ?? 0) + 1;
  });

  const chartData = Object.entries(usersByDate).map(([date, count]) => ({
    date,
    count
  })).sort((a, b) => a.date.localeCompare(b.date));

  const summary: ReportSummary = {
    totalUsers: users.length,
    activeUsers,
    conversionRate: users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0,
    dateRange: `${startDate.toLocaleDateString('fa-IR')} تا ${endDate.toLocaleDateString('fa-IR')}`
  };

  const details: AppointmentData[] = users.slice(0, 20).map(user => ({
    title: user.name || 'کاربر بدون نام',
    description: user.email,
    value: `${user.appointments.length} نوبت`,
    date: user.createdAt.toISOString()
  }));

  return {
    summary,
    details,
    chartData: chartData.map(item => ({
      month: new Date(item.date).toLocaleDateString('fa-IR', { month: 'long' }),
      کاربران: item.count
    }))
  };
}

async function generateServicesReport(startDate: Date, endDate: Date): Promise<ReportResult> {
  const appointments = await db.appointment.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      service: {
        select: {
          name: true,
          price: true
        }
      }
    }
  });

  const serviceStats = appointments.reduce((acc, appointment) => {
    const serviceName = appointment.service.name;
    if (!acc[serviceName]) {
      acc[serviceName] = {
        count: 0,
        revenue: 0
      };
    }
    acc[serviceName].count += 1;
    acc[serviceName].revenue += appointment.service.price || 0;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const services = await db.service.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  const chartData = Object.entries(serviceStats).map(([name, stats]) => ({
    name,
    count: stats.count,
    revenue: stats.revenue
  })).sort((a, b) => b.count - a.count);

  const totalRevenue = Object.values(serviceStats).reduce((sum, stats) => sum + stats.revenue, 0);
  const totalAppointments = appointments.length;

  const summary: ReportSummary = {
    totalServices: services.length,
    totalRevenue,
    totalAppointments,
    mostPopularService: chartData.length > 0 ? chartData[0]!.name : 'ندارد',
    dateRange: `${startDate.toLocaleDateString('fa-IR')} تا ${endDate.toLocaleDateString('fa-IR')}`
  };

  const details: AppointmentData[] = chartData.map((service) => ({
    title: service.name,
    description: `${service.count} نوبت ثبت‌شده`,
    value: `${service.revenue.toLocaleString()} تومان`,
    date: ''
  }));

  return {
    summary,
    details,
    chartData: chartData.map(service => ({
      name: service.name,
      value: service.count
    }))
  };
}

function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'PENDING': 'در انتظار',
    'CONFIRMED': 'تأیید شده',
    'COMPLETED': 'تکمیل شده',
    'CANCELLED': 'لغو شده'
  };

  return statusMap[status] ?? status;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface AppointmentData {
  title: string;
  description: string;
  value: string;
  date: string;
  change?: number;
}

interface ReportSummary {
  [key: string]: string | number;
}

interface ReportResult {
  summary: ReportSummary;
  details: AppointmentData[];
  chartData: any[];
}
