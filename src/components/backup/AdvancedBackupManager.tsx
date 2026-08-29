/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/components/backup/AdvancedBackupManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  Download, 
  Upload, 
  Database, 
  Shield, 
  Clock, 
  HardDrive, 
  RefreshCw, 
  AlertCircle,
  Settings,
  Calendar,
  CheckCircle2,
  Play
} from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { formatFileSize, formatDate } from "~/lib/utils";

export function AdvancedBackupManager() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [autoBackupLogs, setAutoBackupLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadHealthStatus = async () => {
    try {
      const response = await fetch('/api/backup/health');
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      }
    } catch (error) {
      console.error('Error loading health status:', error);
    }
  };

  const loadAutoBackupLogs = async () => {
    try {
      const response = await fetch('/api/backup/auto');
      if (response.ok) {
        const data = await response.json();
        setAutoBackupLogs(data.logs ?? []);
      }
    } catch (error) {
      console.error('Error loading auto backup logs:', error);
    }
  };

  const runAutoBackup = async (type: string) => {
    try {
      const response = await fetch('/api/backup/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        toast({
          title: "موفق",
          description: `بکاپ ${type} خودکار اجرا شد`
        });
        loadAutoBackupLogs();
        loadHealthStatus();
      } else {
        throw new Error('خطا در اجرای بکاپ خودکار');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در اجرای بکاپ خودکار",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadHealthStatus(), loadAutoBackupLogs()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      {/* کارت سلامت سیستم */}
      <Card className={healthStatus?.status === 'CRITICAL' ? 'border-red-200 bg-red-50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="ml-2 h-5 w-5" />
            سلامت سیستم بکاپ
            {healthStatus?.status === 'CRITICAL' && (
              <Badge variant="destructive" className="mr-2">هشدار</Badge>
            )}
          </CardTitle>
          <CardDescription>
            آخرین بررسی: {new Date().toLocaleTimeString('fa-IR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {healthStatus?.summary.healthPercentage}%
              </div>
              <div className="text-sm text-gray-600">درصد سلامت</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold">
                {healthStatus?.summary.healthyBackups}
              </div>
              <div className="text-sm text-gray-600">بکاپ سالم</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold">
                {healthStatus?.summary.totalBackups}
              </div>
              <div className="text-sm text-gray-600">کل بکاپ‌ها</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold">
                {healthStatus?.summary.totalSize}
              </div>
              <div className="text-sm text-gray-600">حجم کل</div>
            </div>
          </div>

          {healthStatus?.warning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-600 ml-2" />
                <span className="text-amber-800">{healthStatus.warning}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* بکاپ خودکار */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="ml-2 h-5 w-5" />
            بکاپ خودکار
          </CardTitle>
          <CardDescription>
            مدیریت بکاپ‌های زمان‌بندی شده
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <Button 
                onClick={() => runAutoBackup('daily')}
                className="w-full"
                variant="outline"
              >
                <Play className="ml-2 h-4 w-4" />
                اجرای بکاپ روزانه
              </Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Button 
                onClick={() => runAutoBackup('weekly')}
                className="w-full"
                variant="outline"
              >
                <Play className="ml-2 h-4 w-4" />
                اجرای بکاپ هفتگی
              </Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Button 
                onClick={() => runAutoBackup('monthly')}
                className="w-full"
                variant="outline"
              >
                <Play className="ml-2 h-4 w-4" />
                اجرای بکاپ ماهانه
              </Button>
            </div>
          </div>

          <h4 className="font-semibold mb-3">تاریخچه بکاپ خودکار</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {autoBackupLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  {log.status === 'SUCCESS' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">بکاپ {log.type}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString('fa-IR')}
                    </div>
                  </div>
                </div>
                <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'}>
                  {log.status === 'SUCCESS' ? 'موفق' : 'ناموفق'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* تنظیمات پیشرفته */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="ml-2 h-5 w-5" />
            تنظیمات پیشرفته
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">فشرده‌سازی بکاپ</p>
                <p className="text-sm text-muted-foreground">
                  کاهش حجم بکاپ‌ها با فشرده‌سازی
                </p>
              </div>
              <Badge variant="outline">به زودی</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">رمزنگاری بکاپ</p>
                <p className="text-sm text-muted-foreground">
                  رمزنگاری فایل‌های بکاپ برای امنیت بیشتر
                </p>
              </div>
              <Badge variant="outline">به زودی</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">آپلود به فضای ابری</p>
                <p className="text-sm text-muted-foreground">
                  ذخیره خودکار بکاپ در سرویس‌های ابری
                </p>
              </div>
              <Badge variant="outline">به زودی</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}