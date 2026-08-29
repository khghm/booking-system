// src/app/admin/settings/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Save, RefreshCw, Database, Bell, Shield, Mail } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">تنظیمات سیستم</h1>
            <p className="text-muted-foreground mt-2">
              مدیریت و پیکربندی تنظیمات سامانه
            </p>
          </div>
          <Button>
            <Save className="ml-2 h-4 w-4" />
            ذخیره تغییرات
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* تنظیمات عمومی */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="ml-2 h-5 w-5" />
                تنظیمات عمومی
              </CardTitle>
              <CardDescription>
                تنظیمات اصلی و عمومی سامانه
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">نام سایت</Label>
                  <Input 
                    id="site-name" 
                    defaultValue="سامانه نوبت‌دهی" 
                    placeholder="نام سایت را وارد کنید"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-url">آدرس سایت</Label>
                  <Input 
                    id="site-url" 
                    defaultValue="https://example.com" 
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">منطقه زمانی</Label>
                  <Select defaultValue="asia/tehran">
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب منطقه زمانی" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia/tehran">تهران (IRST)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="europe/london">لندن (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">زبان پیش‌فرض</Label>
                  <Select defaultValue="fa">
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب زبان" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fa">فارسی</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربیة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">توضیحات سایت</Label>
                <Input 
                  id="description" 
                  placeholder="توضیحات مختصر درباره سایت"
                  defaultValue="سامانه مدیریت و رزرو نوبت آنلاین"
                />
              </div>
            </CardContent>
          </Card>

          {/* تنظیمات اعلان‌ها */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="ml-2 h-5 w-5" />
                تنظیمات اعلان‌ها
              </CardTitle>
              <CardDescription>
                مدیریت نوتیفیکیشن‌ها و اطلاع‌رسانی‌ها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">اعلان‌های ایمیلی</Label>
                  <div className="text-sm text-muted-foreground">
                    ارسال ایمیل برای نوبت‌های جدید
                  </div>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">اعلان‌های پیامکی</Label>
                  <div className="text-sm text-muted-foreground">
                    ارسال پیامک برای یادآوری نوبت
                  </div>
                </div>
                <Switch id="sms-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">اعلان‌های push</Label>
                  <div className="text-sm text-muted-foreground">
                    نمایش اعلان‌های real-time
                  </div>
                </div>
                <Switch id="push-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="admin-notifications">اعلان‌های مدیریت</Label>
                  <div className="text-sm text-muted-foreground">
                    اطلاع‌رسانی به مدیران سیستم
                  </div>
                </div>
                <Switch id="admin-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* تنظیمات امنیتی */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="ml-2 h-5 w-5" />
                تنظیمات امنیتی
              </CardTitle>
              <CardDescription>
                تنظیمات امنیتی و دسترسی‌ها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">احراز هویت دو مرحله‌ای</Label>
                  <div className="text-sm text-muted-foreground">
                    فعال‌سازی 2FA برای کاربران
                  </div>
                </div>
                <Switch id="two-factor" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="password-policy">سیاست کلمه عبور</Label>
                  <div className="text-sm text-muted-foreground">
                    الزام به رمز عبور قوی
                  </div>
                </div>
                <Switch id="password-policy" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="session-timeout">خروج خودکار</Label>
                  <div className="text-sm text-muted-foreground">
                    پس از ۶۰ دقیقه عدم فعالیت
                  </div>
                </div>
                <Switch id="session-timeout" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ip-restriction">محدودیت IP</Label>
                  <div className="text-sm text-muted-foreground">
                    دسترسی فقط از IPهای مجاز
                  </div>
                </div>
                <Switch id="ip-restriction" />
              </div>
            </CardContent>
          </Card>

          {/* تنظیمات ایمیل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="ml-2 h-5 w-5" />
                تنظیمات ایمیل
              </CardTitle>
              <CardDescription>
                پیکربندی سرویس ارسال ایمیل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" defaultValue="smtp.example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" defaultValue="587" type="number" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp-username">نام کاربری</Label>
                <Input id="smtp-username" defaultValue="noreply@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp-password">رمز عبور</Label>
                <Input id="smtp-password" type="password" defaultValue="••••••••" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="smtp-ssl">استفاده از SSL/TLS</Label>
                <Switch id="smtp-ssl" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* عملیات سیستم */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="ml-2 h-5 w-5" />
                عملیات سیستم
              </CardTitle>
              <CardDescription>
                مدیریت و نگهداری سیستم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="ml-2 h-4 w-4" />
                پاک‌سازی کش سیستم
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Database className="ml-2 h-4 w-4" />
                بهینه‌سازی دیتابیس
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="ml-2 h-4 w-4" />
                بازسازی ایندکس‌ها
              </Button>
              
              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full justify-start">
                  <RefreshCw className="ml-2 h-4 w-4" />
                  راه‌اندازی مجدد سیستم
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}