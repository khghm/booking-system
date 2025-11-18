// src/components/notifications/NotificationPreferences.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    emailReminders: true,
    smsReminders: true,
    pushNotifications: true,
    marketingEmails: false,
    appointmentChanges: true,
    newServices: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // ذخیره تنظیمات در دیتابیس
      await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      toast({
        title: "تنظیمات ذخیره شد",
        description: "ترجیحات اطلاع‌رسانی شما با موفقیت به‌روزرسانی شد.",
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تنظیمات اطلاع‌رسانی</CardTitle>
        <CardDescription>
          مدیریت نحوه و زمان دریافت اطلاعیه‌ها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">یادآوری نوبت‌ها</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-reminders">ایمیل یادآوری</Label>
              <p className="text-sm text-muted-foreground">
                دریافت ایمیل ۲۴ ساعت قبل از نوبت
              </p>
            </div>
            <Switch
              id="email-reminders"
              checked={preferences.emailReminders}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, emailReminders: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-reminders">پیامک یادآوری</Label>
              <p className="text-sm text-muted-foreground">
                دریافت پیامک ۱ ساعت قبل از نوبت
              </p>
            </div>
            <Switch
              id="sms-reminders"
              checked={preferences.smsReminders}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, smsReminders: checked }))
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">اطلاعیه‌های سیستم</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="appointment-changes">تغییرات نوبت</Label>
              <p className="text-sm text-muted-foreground">
                اطلاع‌رسانی در صورت تغییر یا لغو نوبت
              </p>
            </div>
            <Switch
              id="appointment-changes"
              checked={preferences.appointmentChanges}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, appointmentChanges: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-services">سرویس‌های جدید</Label>
              <p className="text-sm text-muted-foreground">
                اطلاع‌رسانی سرویس‌ها و تخفیف‌های جدید
              </p>
            </div>
            <Switch
              id="new-services"
              checked={preferences.newServices}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, newServices: checked }))
              }
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </Button>
      </CardContent>
    </Card>
  );
}