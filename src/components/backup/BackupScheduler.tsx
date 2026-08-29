/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
// src/components/backup/BackupScheduler.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Clock, Calendar, Save, Play, Pause } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface ScheduleConfig {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  keepLast: number;
  compress: boolean;
  lastRun?: string;
  nextRun?: string;
}

export function BackupScheduler() {
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    enabled: false,
    frequency: 'DAILY',
    time: '02:00',
    keepLast: 10,
    compress: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const response = await fetch('/api/backup/schedule');
      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در دریافت تنظیمات زمان‌بندی",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/backup/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });

      if (response.ok) {
        toast({
          title: "موفق",
          description: "تنظیمات زمان‌بندی ذخیره شد",
        });
        await loadSchedule();
      } else {
        throw new Error('خطا در ذخیره تنظیمات');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات زمان‌بندی",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const runScheduleNow = async () => {
    try {
      const response = await fetch('/api/backup/schedule/run', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "موفق",
          description: "بکاپ زمان‌بندی شده اجرا شد",
        });
      } else {
        throw new Error('خطا در اجرای بکاپ');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در اجرای بکاپ زمان‌بندی شده",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>زمان‌بندی خودکار بکاپ</CardTitle>
          <CardDescription>در حال بارگذاری...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="ml-2 h-5 w-5" />
          زمان‌بندی خودکار بکاپ
        </CardTitle>
        <CardDescription>
          پیکربندی بکاپ‌گیری خودکار بر اساس زمان‌بندی مشخص
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* وضعیت زمان‌بندی */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">بکاپ خودکار</p>
            <p className="text-sm text-muted-foreground">
              {schedule.enabled ? 'فعال' : 'غیرفعال'}
            </p>
          </div>
          <Switch
            checked={schedule.enabled}
            onCheckedChange={(checked) => setSchedule(prev => ({ ...prev, enabled: checked }))}
          />
        </div>

        {schedule.enabled && (
          <>
            {/* تنظیمات فرکانس */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">دفعات بکاپ</Label>
                <Select
                  value={schedule.frequency}
                  onValueChange={(value: 'DAILY' | 'WEEKLY' | 'MONTHLY') => 
                    setSchedule(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">روزانه</SelectItem>
                    <SelectItem value="WEEKLY">هفتگی</SelectItem>
                    <SelectItem value="MONTHLY">ماهانه</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">ساعت اجرا</Label>
                <Input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => setSchedule(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              {schedule.frequency === 'WEEKLY' && (
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">روز هفته</Label>
                  <Select
                    value={schedule.dayOfWeek?.toString() ?? '0'}
                    onValueChange={(value) => 
                      setSchedule(prev => ({ ...prev, dayOfWeek: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">شنبه</SelectItem>
                      <SelectItem value="1">یکشنبه</SelectItem>
                      <SelectItem value="2">دوشنبه</SelectItem>
                      <SelectItem value="3">سه‌شنبه</SelectItem>
                      <SelectItem value="4">چهارشنبه</SelectItem>
                      <SelectItem value="5">پنجشنبه</SelectItem>
                      <SelectItem value="6">جمعه</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {schedule.frequency === 'MONTHLY' && (
                <div className="space-y-2">
                  <Label htmlFor="dayOfMonth">روز ماه</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={schedule.dayOfMonth ?? 1}
                    onChange={(e) => setSchedule(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                  />
                </div>
              )}
            </div>

            {/* تنظیمات پیشرفته */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keepLast">تعداد بکاپ‌های نگهداری شده</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={schedule.keepLast}
                  onChange={(e) => setSchedule(prev => ({ ...prev, keepLast: parseInt(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">
                  آخرین {schedule.keepLast} بکاپ نگهداری می‌شود
                </p>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse pt-6">
                <Switch
                  id="compress"
                  checked={schedule.compress}
                  onCheckedChange={(checked) => setSchedule(prev => ({ ...prev, compress: checked }))}
                />
                <Label htmlFor="compress">فشرده‌سازی بکاپ</Label>
              </div>
            </div>

            {/* اطلاعات اجرا */}
            {(schedule.lastRun ?? schedule.nextRun) && (
              <div className="p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Calendar className="ml-2 h-4 w-4" />
                  اطلاعات اجرا
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {schedule.lastRun && (
                    <div>
                      <span className="text-blue-700">آخرین اجرا: </span>
                      <span>{new Date(schedule.lastRun).toLocaleString('fa-IR')}</span>
                    </div>
                  )}
                  {schedule.nextRun && (
                    <div>
                      <span className="text-blue-700">اجرای بعدی: </span>
                      <span>{new Date(schedule.nextRun).toLocaleString('fa-IR')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* دکمه‌های action */}
        <div className="flex gap-2 pt-4">
          <Button onClick={saveSchedule} disabled={isSaving}>
            <Save className="ml-2 h-4 w-4" />
            {isSaving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </Button>
          
          {schedule.enabled && (
            <Button variant="outline" onClick={runScheduleNow}>
              <Play className="ml-2 h-4 w-4" />
              اجرای الآن
            </Button>
          )}
        </div>

        {/* راهنمای cron */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium mb-2">راهنمای تنظیم cron job</h4>
          <code className="text-sm bg-black text-white p-2 rounded block font-mono">
            {schedule.enabled ? generateCronCommand(schedule) : '# ابتدا زمان‌بندی را فعال کنید'}
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            این دستور را در crontab سرور خود قرار دهید
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function generateCronCommand(schedule: ScheduleConfig): string {
  if (!schedule.enabled) return '# زمان‌بندی غیرفعال است';
  
  const time = schedule.time.split(':');
  const minute = time[1];
  const hour = time[0];
  
  let dayOfMonth = '*';
  const month = '*';
  let dayOfWeek = '*';
  
  if (schedule.frequency === 'DAILY') {
    // هر روز
  } else if (schedule.frequency === 'WEEKLY') {
    dayOfWeek = schedule.dayOfWeek?.toString() ?? '0';
  } else if (schedule.frequency === 'MONTHLY') {
    dayOfMonth = schedule.dayOfMonth?.toString() ?? '1';
  }
  
  return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} curl -X POST http://localhost:3000/api/backup/create`;
}