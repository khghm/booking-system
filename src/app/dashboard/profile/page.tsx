/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// src/app/dashboard/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "~/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { User, Mail, Phone, Shield, Calendar } from "lucide-react";
import { db } from "~/lib/db";
import { ProfileForm } from "~/components/profile/ProfileForm";

async function getUserProfile(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        appointments: {
          select: {
            id: true,
            status: true,
            date: true,
            service: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          },
          take: 5
        }
      }
    });

    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userProfile = await getUserProfile(session.user.id);

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">خطا در بارگذاری پروفایل</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    totalAppointments: userProfile.appointments.length,
    completedAppointments: userProfile.appointments.filter(a => a.status === 'COMPLETED').length,
    pendingAppointments: userProfile.appointments.filter(a => a.status === 'PENDING').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">پروفایل کاربری</h1>
          <p className="text-muted-foreground">
            مدیریت اطلاعات حساب کاربری شما
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* فرم ویرایش پروفایل */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileForm user={userProfile} />
          </div>

          {/* کارت خلاصه */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>خلاصه حساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{userProfile.name || 'کاربر'}</p>
                    <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">نقش:</span>
                    <Badge variant={userProfile.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {userProfile.role === 'ADMIN' ? 'مدیر سیستم' : 'کاربر عادی'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">عضویت از:</span>
                    <span className="text-sm">
                      {new Date(userProfile.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">وضعیت:</span>
                    <Badge variant="default">فعال</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* آمار کاربر */}
            <Card>
              <CardHeader>
                <CardTitle>آمار کاربر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">کل نوبت‌ها:</span>
                  </div>
                  <span className="font-semibold">{stats.totalAppointments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm">تکمیل شده:</span>
                  </div>
                  <span className="font-semibold">{stats.completedAppointments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">در انتظار:</span>
                  </div>
                  <span className="font-semibold">{stats.pendingAppointments}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* امنیت */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="ml-2 h-5 w-5" />
              امنیت و حریم خصوصی
            </CardTitle>
            <CardDescription>
              مدیریت تنظیمات امنیتی حساب کاربری
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">تغییر رمز عبور</p>
                <p className="text-sm text-muted-foreground">
                  آخرین تغییر: ۳ ماه پیش
                </p>
              </div>
              <Button variant="outline">تغییر رمز</Button>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">احراز هویت دو مرحله‌ای</p>
                <p className="text-sm text-muted-foreground">
                  برای امنیت بیشتر فعال کنید
                </p>
              </div>
              <Button variant="outline">فعال‌سازی</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}