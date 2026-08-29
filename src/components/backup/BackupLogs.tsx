/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/components/backup/BackupLogs.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Download, RefreshCw, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { formatDate, formatTime } from "~/lib/utils";

interface BackupLog {
  id: string;
  action: 'CREATE' | 'RESTORE' | 'DELETE' | 'DOWNLOAD';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  filename?: string;
  details: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
  fileSize?: number;
  errorMessage?: string;
}

export function BackupLogs() {
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/backup/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        throw new Error('خطا در دریافت گزارش‌ها');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در دریافت گزارش‌های بکاپ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionText = (action: string) => {
    const actions: Record<string, string> = {
      'CREATE': 'ایجاد بکاپ',
      'RESTORE': 'بازیابی',
      'DELETE': 'حذف',
      'DOWNLOAD': 'دانلود'
    };
    return actions[action] ?? action;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return "default";
      case 'FAILED':
        return "destructive";
      case 'PENDING':
        return "secondary";
      default:
        return "outline";
    }
  };

  const exportLogs = async () => {
    try {
      const csvContent = [
        ['تاریخ', 'زمان', 'عملیات', 'وضعیت', 'فایل', 'جزئیات', 'خطا'],
        ...logs.map(log => [
          formatDate(log.createdAt),
          formatTime(log.createdAt),
          getActionText(log.action),
          log.status === 'SUCCESS' ? 'موفق' : log.status === 'FAILED' ? 'ناموفق' : 'در حال انجام',
          log.filename ?? '-',
          log.details,
          log.errorMessage ?? '-'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "موفق",
        description: "گزارش با موفقیت export شد",
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در export گزارش",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>گزارش‌های بکاپ</CardTitle>
          <CardDescription>در حال بارگذاری...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>گزارش‌های بکاپ</CardTitle>
            <CardDescription>
              تاریخچه کامل عملیات بکاپ و بازیابی
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadLogs}>
              <RefreshCw className="ml-2 h-4 w-4" />
              بروزرسانی
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="ml-2 h-4 w-4" />
              خروجی CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>هیچ گزارشی یافت نشد</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4 space-x-reverse flex-1">
                    {getStatusIcon(log.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 space-x-reverse mb-1">
                        <span className="font-medium text-sm">
                          {getActionText(log.action)}
                        </span>
                        <Badge variant={getStatusVariant(log.status)} className="text-xs">
                          {log.status === 'SUCCESS' ? 'موفق' : log.status === 'FAILED' ? 'ناموفق' : 'در حال انجام'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {log.details}
                        {log.filename && (
                          <span className="font-mono text-xs bg-muted px-1 rounded mr-2">
                            {log.filename}
                          </span>
                        )}
                      </div>
                      {log.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">
                          {log.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-left whitespace-nowrap">
                    <div>{formatDate(log.createdAt)}</div>
                    <div>{formatTime(log.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}