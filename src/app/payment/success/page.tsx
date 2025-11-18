// src/app/payment/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CheckCircle, Download, Calendar } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const refId = searchParams.get('refId');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">پرداخت موفق</CardTitle>
            <CardDescription>
              پرداخت شما با موفقیت انجام شد و نوبت شما رزرو گردید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {refId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <span className="font-medium">کد رهگیری:</span> {refId}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-muted-foreground">
                یک ایمیل تأیید با جزئیات نوبت برای شما ارسال خواهد شد.
              </p>
              
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/dashboard/appointments">
                    <Calendar className="ml-2 h-4 w-4" />
                    مشاهده نوبت‌ها
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <Download className="ml-2 h-4 w-4" />
                    دریافت فاکتور
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}