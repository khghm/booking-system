/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/components/backup/BackupManager.tsx - آپدیت شده
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Download, Upload, Database, Shield, Clock, HardDrive, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { formatFileSize, formatDate } from "~/lib/utils";
import { BackupValidator } from "./BackupValidator";
import { BackupScheduler } from "./BackupScheduler";
import { BackupLogs } from "./BackupLogs";
import { AdvancedBackupManager } from "./AdvancedBackupManager";

interface Backup {
  id: string;
  filename: string;
  size: number;
  tables: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  fileExists?: boolean;
}

export function BackupManager() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadBackups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/backup');
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      } else {
        throw new Error('خطا در دریافت لیست بکاپ‌ها');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در دریافت لیست بکاپ‌ها",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "موفق",
          description: data.message ?? "بکاپ با موفقیت ایجاد شد",
        });
        await loadBackups();
      } else {
        throw new Error(data.error ?? 'خطا در ایجاد بکاپ');
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = async (backupId: string, filename: string) => {
    try {
      const response = await fetch(`/api/backup/${backupId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "موفق",
          description: "دانلود بکاپ شروع شد",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error ?? 'خطا در دانلود بکاپ');
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const restoreBackup = async (backupId: string, filename: string) => {
    if (!confirm(`آیا از بازیابی بکاپ "${filename}" اطمینان دارید؟ تمام داده‌های فعلی جایگزین خواهند شد. این عمل غیرقابل بازگشت است.`)) {
      return;
    }

    setIsRestoring(backupId);
    try {
      const response = await fetch(`/api/backup/${backupId}/restore`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "موفق",
          description: data.message ?? "بازیابی با موفقیت انجام شد",
        });
        await loadBackups();
      } else {
        throw new Error(data.error ?? 'خطا در بازیابی بکاپ');
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRestoring(null);
    }
  };

  const getStatusVariant = (status: string, fileExists?: boolean) => {
    if (!fileExists) return "destructive";
    if (status === 'COMPLETED') return "default";
    if (status === 'PENDING') return "secondary";
    if (status === 'FAILED') return "destructive";
    return "secondary";
  };

  const getStatusText = (status: string, fileExists?: boolean) => {
    if (!fileExists) return "فایل یافت نشد";
    if (status === 'COMPLETED') return "تکمیل شده";
    if (status === 'PENDING') return "در حال انجام";
    if (status === 'FAILED') return "ناموفق";
    return status;
  };

  const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
  const completedBackups = backups.filter(b => b.status === 'COMPLETED' && b.fileExists).length;
  const failedBackups = backups.filter(b => b.status === 'FAILED' || !b.fileExists).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">مدیریت بکاپ و بازیابی</h2>
          <Button disabled>
            <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
            در حال بارگذاری...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">مدیریت بکاپ و بازیابی</h2>
        <div className="flex gap-2">
          <Button onClick={loadBackups} variant="outline">
            <RefreshCw className="ml-2 h-4 w-4" />
            بروزرسانی
          </Button>
          <Button onClick={createBackup} disabled={isCreatingBackup}>
            <Database className="ml-2 h-4 w-4" />
            {isCreatingBackup ? "در حال ایجاد بکاپ..." : "ایجاد بکاپ جدید"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">وضعیت بکاپ</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedBackups > 0 ? "فعال" : "غیرفعال"}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedBackups} بکاپ معتبر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تعداد بکاپ‌ها</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
            <p className="text-xs text-muted-foreground">
              {failedBackups > 0 && `${failedBackups} ناموفق`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حجم کل</CardTitle>
            <Database className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
            <p className="text-xs text-muted-foreground">
              میانگین {formatFileSize(totalSize / (backups.length || 1))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* لیست بکاپ‌ها */}
      <Card>
        <CardHeader>
          <CardTitle>بکاپ‌های موجود</CardTitle>
          <CardDescription>
            مدیریت و بازیابی بکاپ‌های سیستم - آخرین ۱۰ بکاپ نگهداری می‌شوند
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هنوز بکاپی ایجاد نشده است</p>
              <Button onClick={createBackup} className="mt-4" disabled={isCreatingBackup}>
                ایجاد اولین بکاپ
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4 space-x-reverse flex-1">
                    <div className="shrink-0">
                      {backup.fileExists === false ? (
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      ) : (
                        <Database className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 space-x-reverse mb-1">
                        <p className="font-medium truncate">{backup.filename}</p>
                        <Badge variant={getStatusVariant(backup.status, backup.fileExists)}>
                          {getStatusText(backup.status, backup.fileExists)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 ml-1" />
                          {formatDate(backup.createdAt)}
                        </div>
                        <div>{formatFileSize(backup.size)}</div>
                        <div>{backup.tables} جدول</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBackup(backup.id, backup.filename)}
                      disabled={backup.status !== 'COMPLETED' || backup.fileExists === false}
                    >
                      <Download className="ml-2 h-4 w-4" />
                      دانلود
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => restoreBackup(backup.id, backup.filename)}
                      disabled={backup.status !== 'COMPLETED' || backup.fileExists === false || isRestoring === backup.id}
                    >
                      {isRestoring === backup.id ? (
                        <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="ml-2 h-4 w-4" />
                      )}
                      {isRestoring === backup.id ? "در حال بازیابی..." : "بازیابی"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* تنظیمات بکاپ خودکار */}
      <Card>
        <CardHeader>
          <CardTitle>تنظیمات بکاپ خودکار</CardTitle>
          <CardDescription>
            پیکربندی بکاپ‌گیری خودکار سیستم (نیاز به راه‌اندازی cron job)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <BackupScheduler />
                <BackupValidator />
                <BackupLogs />
                <AdvancedBackupManager />
                <p className="font-medium">بکاپ روزانه</p>
                <p className="text-sm text-muted-foreground">
                  هر روز ساعت ۲ بامداد (از طریق cron job)
                </p>
              </div>
              <Badge variant="outline">نیاز به تنظیم</Badge>
            </div>

            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">بکاپ هفتگی</p>
                <p className="text-sm text-muted-foreground">
                  هر شنبه ساعت ۳ بامداد (از طریق cron job)
                </p>
              </div>
              <Badge variant="outline">نیاز به تنظیم</Badge>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">راهنمای تنظیم cron job</h4>
              <code className="text-sm bg-blue-100 p-2 rounded block text-blue-800">
                0 2 * * * curl -X POST http://localhost:3000/api/backup/create
              </code>
              <p className="text-sm text-blue-700 mt-2">
                این دستور را در crontab خود اضافه کنید تا بکاپ روزانه ایجاد شود
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}