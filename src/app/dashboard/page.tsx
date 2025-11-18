/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "~/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Calendar, Clock, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { db } from "~/lib/db";
import { formatDate, formatTime } from "~/lib/utils";

async function getDashboardData(userId: string) {
  try {
    // دریافت نوبت‌های آینده
    const upcomingAppointments = await db.appointment.findMany({
      where: { 
        userId: userId,
        date: {
          gte: new Date() // نوبت‌های آینده
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true
          }
        },
        branch: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: { 
        date: 'asc' 
      },
      take: 5 // فقط ۵ نوبت آینده
    });

    // آمار کلی
    const totalAppointments = await db.appointment.count({
      where: { userId: userId }
    });

    const pendingAppointments = await db.appointment.count({
      where: { 
        userId: userId,
        status: 'PENDING'
      }
    });

    const confirmedAppointments = await db.appointment.count({
      where: { 
        userId: userId,
        status: 'CONFIRMED'
      }
    });

    // فعالیت‌های اخیر
    const recentActivity = await db.appointment.findMany({
      where: { 
        userId: userId 
      },
      include: {
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: { 
        createdAt: 'desc' 
      },
      take: 5
    });

    // تبدیل به فرمت مورد نیاز
    const activityData = recentActivity.map(apt => {
      let message = '';
      let type: 'appointment' | 'payment' | 'reminder' = 'appointment';

      switch (apt.status) {
        case 'PENDING':
          message = `نوبت ${apt.service.name} در انتظار تأیید`;
          break;
        case 'CONFIRMED':
          message = `نوبت ${apt.service.name} تأیید شد`;
          type = 'reminder';
          break;
        case 'COMPLETED':
          message = `نوبت ${apt.service.name} تکمیل شد`;
          break;
        case 'CANCELLED':
          message = `نوبت ${apt.service.name} لغو شد`;
          break;
        default:
          message = `نوبت ${apt.service.name} رزرو شد`;
      }

      return {
        id: apt.id,
        type,
        message,
        time: formatDate(apt.createdAt)
      };
    });

    return {
      upcomingAppointments,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      recentActivity: activityData
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      upcomingAppointments: [],
      totalAppointments: 0,
      pendingAppointments: 0,
      confirmedAppointments: 0,
      recentActivity: []
    };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const dashboardData = await getDashboardData(session.user.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'تأیید شده';
      case 'PENDING':
        return 'در انتظار تأیید';
      case 'COMPLETED':
        return 'تکمیل شده';
      case 'CANCELLED':
        return 'لغو شده';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">خوش آمدید</h1>
            <p className="text-muted-foreground">
              {session.user.name || session.user.email}
            </p>
          </div>
          <Link href="/bookings">
            <Button>
              رزرو نوبت جدید
              <ArrowRight className="mr-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* کارت‌های آماری */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل نوبت‌ها</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                از ابتدا تا کنون
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نوبت‌های پیش‌رو</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                نوبت در هفته جاری
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">در انتظار تأیید</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.pendingAppointments}</div>
              <p className="text-xs text-muted-foreground">
                نیاز به تأیید مدیریت
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تأیید شده</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.confirmedAppointments}</div>
              <p className="text-xs text-muted-foreground">
                نوبت‌های فعال
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* نوبت‌های پیش‌رو */}
          <Card>
            <CardHeader>
              <CardTitle>نوبت‌های پیش‌رو</CardTitle>
              <CardDescription>
                نزدیک‌ترین نوبت‌های شما
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">هیچ نوبت پیش‌رویی ندارید</p>
                  <Link href="/bookings" className="inline-block mt-4">
                    <Button size="sm">
                      رزرو نوبت جدید
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        {getStatusIcon(appointment.status)}
                        <div>
                          <p className="font-medium">{appointment.service.name}</p>
                          <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
                            <span>{formatDate(appointment.date)}</span>
                            <span>{formatTime(appointment.date)}</span>
                            <span>{appointment.branch.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getStatusText(appointment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* فعالیت‌های اخیر */}
          <Card>
            <CardHeader>
              <CardTitle>فعالیت‌های اخیر</CardTitle>
              <CardDescription>
                آخرین فعالیت‌های شما در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">هنوز فعالیتی ثبت نشده</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'appointment' ? 'bg-blue-500' :
                          activity.type === 'payment' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{activity.message}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* دسترسی سریع */}
        <Card>
          <CardHeader>
            <CardTitle>دسترسی سریع</CardTitle>
            <CardDescription>
              اقدامات سریع برای مدیریت نوبت‌ها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/bookings">
                <Card className="card-hover cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all">
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold">رزرو نوبت</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      رزرو نوبت جدید
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/appointments">
                <Card className="card-hover cursor-pointer border-2 border-transparent hover:border-green-200 transition-all">
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold">نوبت‌های من</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      مدیریت نوبت‌ها
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/profile">
                <Card className="card-hover cursor-pointer border-2 border-transparent hover:border-purple-200 transition-all">
                  <CardContent className="p-6 text-center">
                    <User className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold">پروفایل</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      اطلاعات کاربری
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {session.user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Card className="card-hover cursor-pointer border-2 border-transparent hover:border-red-200 transition-all">
                    <CardContent className="p-6 text-center">
                      <User className="h-8 w-8 mx-auto mb-2 text-red-600" />
                      <h3 className="font-semibold">پنل مدیریت</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        مدیریت سیستم
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* نکات مهم */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 space-x-reverse">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">نکات مهم</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• نوبت‌های در انتظار تأیید، پس از بررسی توسط مدیریت فعال می‌شوند</li>
                  <li>• می‌توانید نوبت‌های pending را تا ۲۴ ساعت قبل لغو کنید</li>
                  <li>• برای تغییر نوبت، لطفاً ابتدا نوبت قبلی را لغو کنید</li>
                  <li>• در صورت وجود هرگونه سوال با پشتیبانی تماس بگیرید</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}