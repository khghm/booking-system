// src/app/dashboard/settings/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "~/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Bell, Shield, Mail } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">تنظیمات</h1>
          <p className="text-muted-foreground">
            مدیریت تنظیمات حساب کاربری و اطلاع‌رسانی
          </p>
        </div>

        {/* تنظیمات اطلاع‌رسانی */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="ml-2 h-5 w-5" />
              تنظیمات اطلاع‌رسانی
            </CardTitle>
            <CardDescription>
              مدیریت نحوه دریافت اطلاعیه‌ها و هشدارها
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">اعلان‌های ایمیلی</Label>
                <p className="text-sm text-muted-foreground">
                  دریافت ایمیل برای نوبت‌های جدید و تغییرات
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">اعلان‌های پیامکی</Label>
                <p className="text-sm text-muted-foreground">
                  دریافت پیامک برای یادآوری نوبت‌ها
                </p>
              </div>
              <Switch id="sms-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">ایمیل‌های تبلیغاتی</Label>
                <p className="text-sm text-muted-foreground">
                  دریافت پیشنهادات ویژه و تخفیف‌ها
                </p>
              </div>
              <Switch id="marketing-emails" />
            </div>
          </CardContent>
        </Card>

        {/* حریم خصوصی */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="ml-2 h-5 w-5" />
              حریم خصوصی
            </CardTitle>
            <CardDescription>
              مدیریت تنظیمات حریم خصوصی و داده‌ها
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-collection">جمع‌آوری داده‌های استفاده</Label>
                <p className="text-sm text-muted-foreground">
                  کمک به بهبود سرویس با ارسال داده‌های ناشناس
                </p>
              </div>
              <Switch id="data-collection" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profile-visible">پروفایل عمومی</Label>
                <p className="text-sm text-muted-foreground">
                  نمایش پروفایل شما برای کاربران دیگر
                </p>
              </div>
              <Switch id="profile-visible" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>ذخیره تغییرات</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}