/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/components/backup/BackupValidator.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, Play, Shield } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface ValidationResult {
  isValid: boolean;
  checks: {
    fileExists: boolean;
    fileSize: boolean;
    databaseStructure: boolean;
    dataIntegrity: boolean;
    tablesCount: boolean;
  };
  details: {
    expectedTables: number;
    actualTables: number;
    fileSize: number;
    expectedFileSize: number;
    errors: string[];
  };
}

export function BackupValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const validateBackup = async (backupId: string) => {
    setIsValidating(true);
    try {
      const response = await fetch(`/api/backup/${backupId}/validate`);
      const data = await response.json();

      if (response.ok) {
        setValidationResult(data);
        toast({
          title: "اعتبارسنجی کامل شد",
          description: data.isValid ? "بکاپ معتبر است" : "بکاپ نامعتبر است",
          variant: data.isValid ? "default" : "destructive",
        });
      } else {
        throw new Error(data.error ?? 'خطا در اعتبارسنجی');
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getCheckIcon = (check: boolean) => {
    return check ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getOverallStatus = () => {
    if (!validationResult) return null;
    
    const totalChecks = Object.keys(validationResult.checks).length;
    const passedChecks = Object.values(validationResult.checks).filter(Boolean).length;
    return (passedChecks / totalChecks) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="ml-2 h-5 w-5" />
          اعتبارسنجی بکاپ
        </CardTitle>
        <CardDescription>
          بررسی سلامت و اعتبار فایل‌های بکاپ قبل از بازیابی
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* دکمه اعتبارسنجی نمونه */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
          <div>
            <p className="font-medium">بکاپ نمونه برای تست</p>
            <p className="text-sm text-muted-foreground">
              اعتبارسنجی آخرین بکاپ ایجاد شده
            </p>
          </div>
          <Button 
            onClick={() => validateBackup('latest')}
            disabled={isValidating}
          >
            {isValidating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                در حال بررسی...
              </div>
            ) : (
              <div className="flex items-center">
                <Play className="ml-2 h-4 w-4" />
                شروع اعتبارسنجی
              </div>
            )}
          </Button>
        </div>

        {/* نتایج اعتبارسنجی */}
        {validationResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">نتیجه کلی:</span>
              <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                {validationResult.isValid ? "معتبر" : "نامعتبر"}
              </Badge>
            </div>

            <Progress value={getOverallStatus()} className="h-2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>وجود فایل</span>
                {getCheckIcon(validationResult.checks.fileExists)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>سایز فایل</span>
                {getCheckIcon(validationResult.checks.fileSize)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>ساختار دیتابیس</span>
                {getCheckIcon(validationResult.checks.databaseStructure)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>یکپارچگی داده‌ها</span>
                {getCheckIcon(validationResult.checks.dataIntegrity)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>تعداد جداول</span>
                {getCheckIcon(validationResult.checks.tablesCount)}
              </div>
            </div>

            {/* جزئیات خطاها */}
            {validationResult.details.errors.length > 0 && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">خطاهای شناسایی شده:</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationResult.details.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* راهنمای اعتبارسنجی */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-medium text-amber-900 mb-2 flex items-center">
            <AlertTriangle className="ml-2 h-4 w-4" />
            نکات مهم اعتبارسنجی
          </h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• همیشه قبل از بازیابی، بکاپ را اعتبارسنجی کنید</li>
            <li>• بکاپ‌های نامعتبر ممکن باعث از دست رفتن داده‌ها شوند</li>
            <li>• بررسی یکپارچگی داده‌ها ممکن است چند دقیقه طول بکشد</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}