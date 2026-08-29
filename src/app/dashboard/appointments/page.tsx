/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/app/dashboard/appointments/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "~/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Calendar, Clock, MapPin, User, RefreshCw } from "lucide-react";
import Link from "next/link";
import { db } from "~/lib/db";
import { formatDate, formatTime } from "~/lib/utils";
import { AppointmentsListClient } from "~/components/dashboard/AppointmentsListClient";

async function getAppointments(userId: string) {
  try {
    const appointments = await db.appointment.findMany({
      where: { 
        userId: userId 
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        },
        invoices: {
          select: {
            status: true,
            total: true,
          },
          take: 1,
        }
      },
      orderBy: { 
        date: 'desc' 
      }
    });

    return appointments.map(apt => ({
      ...apt,
      date: apt.date.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const appointments = await getAppointments(session.user.id);

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "secondary",
      CONFIRMED: "default",
      COMPLETED: "outline",
      CANCELLED: "destructive"
    } as const;

    const labels = {
      PENDING: "در انتظار تأیید",
      CONFIRMED: "تأیید شده",
      COMPLETED: "تکمیل شده",
      CANCELLED: "لغو شده"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "text-yellow-600",
      CONFIRMED: "text-green-600",
      COMPLETED: "text-blue-600",
      CANCELLED: "text-red-600"
    };
    return colors[status as keyof typeof colors] || "text-gray-600";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">نوبت‌های من</h1>
            <p className="text-muted-foreground">
              مدیریت و مشاهده تمام نوبت‌های شما
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/bookings">
              <Button>
                رزرو نوبت جدید
                <Calendar className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* آمار کلی */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">کل نوبت‌ها</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تأیید شده</p>
                  <p className="text-2xl font-bold">
                    {appointments.filter(a => a.status === 'CONFIRMED').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">در انتظار</p>
                  <p className="text-2xl font-bold">
                    {appointments.filter(a => a.status === 'PENDING').length}
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تکمیل شده</p>
                  <p className="text-2xl font-bold">
                    {appointments.filter(a => a.status === 'COMPLETED').length}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>لیست نوبت‌ها</CardTitle>
            <CardDescription>
              تمام نوبت‌های گذشته و آینده شما - {appointments.length} نوبت
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز نوبتی ندارید</h3>
                <p className="text-muted-foreground mb-6">
                  اولین نوبت خود را رزرو کنید تا اینجا نمایش داده شود
                </p>
                <Link href="/bookings">
                  <Button>
                    رزرو نوبت جدید
                  </Button>
                </Link>
              </div>
            ) : (
              <AppointmentsListClient
                appointments={appointments}
              />
            )}
          </CardContent>
        </Card>

        {/* راهنما */}
        <Card>
          <CardHeader>
            <CardTitle>راهنمای وضعیت نوبت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge variant="secondary">در انتظار تأیید</Badge>
                <span className="text-muted-foreground">نوبت در انتظار تأیید مدیریت</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge variant="default">تأیید شده</Badge>
                <span className="text-muted-foreground">نوبت تأیید شده و فعال</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge variant="outline">تکمیل شده</Badge>
                <span className="text-muted-foreground">نوبت انجام شده</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge variant="destructive">لغو شده</Badge>
                <span className="text-muted-foreground">نوبت لغو شده</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}