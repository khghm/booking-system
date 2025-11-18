/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/payment/PaymentForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { CreditCard, Wallet, DollarSign, Loader2 } from "lucide-react";

interface PaymentFormProps {
  appointment: {
    id: string;
    service: {
      name: string;
      price: number;
      duration: number;
    };
    branch: {
      name: string;
    };
    date: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({ appointment, onSuccess, onCancel }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<'ZARINPAL' | 'WALLET' | 'CASH'>('ZARINPAL');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          paymentMethod: selectedMethod,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (selectedMethod === 'ZARINPAL' && result.redirectUrl) {
          // هدایت به درگاه پرداخت
          window.location.href = result.redirectUrl;
        } else if (selectedMethod === 'CASH') {
          // پرداخت نقدی موفق
          toast({
            title: "پرداخت موفق",
            description: "نوبت شما با پرداخت نقدی تأیید شد",
          });
          onSuccess?.();
          router.push('/dashboard/appointments');
        } else {
          // پرداخت کیف پول
          toast({
            title: "پرداخت موفق",
            description: "پرداخت از کیف پول با موفقیت انجام شد",
          });
          onSuccess?.();
          router.push('/dashboard/appointments');
        }
      } else {
        throw new Error(result.error || 'خطا در پرداخت');
      }
    } catch (error: any) {
      toast({
        title: "خطا در پرداخت",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>پرداخت</CardTitle>
        <CardDescription>
          پرداخت هزینه نوبت {appointment.service.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* خلاصه نوبت */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>سرویس:</span>
            <span className="font-medium">{appointment.service.name}</span>
          </div>
          <div className="flex justify-between">
            <span>شعبه:</span>
            <span className="font-medium">{appointment.branch.name}</span>
          </div>
          <div className="flex justify-between">
            <span>تاریخ:</span>
            <span className="font-medium">
              {new Date(appointment.date).toLocaleDateString('fa-IR')}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>مبلغ قابل پرداخت:</span>
            <span className="text-green-600">
              {appointment.service.price.toLocaleString()} تومان
            </span>
          </div>
        </div>

        {/* روش‌های پرداخت */}
        <div className="space-y-4">
          <Label>روش پرداخت</Label>
          <RadioGroup value={selectedMethod} onValueChange={(value: any) => setSelectedMethod(value)}>
            <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="ZARINPAL" id="zarinpal" />
              <CreditCard className="h-5 w-5 ml-2" />
              <Label htmlFor="zarinpal" className="flex-1 cursor-pointer">
                پرداخت آنلاین (زرین پال)
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="WALLET" id="wallet" />
              <Wallet className="h-5 w-5 ml-2" />
              <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                پرداخت از کیف پول
              </Label>
              <span className="text-sm text-muted-foreground">
                موجودی: ۰ تومان
              </span>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="CASH" id="cash" />
              <DollarSign className="h-5 w-5 ml-2" />
              <Label htmlFor="cash" className="flex-1 cursor-pointer">
                پرداخت نقدی در محل
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* دکمه‌های action */}
        <div className="flex gap-2">
          <Button 
            onClick={handlePayment} 
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {isProcessing ? "در حال پرداخت..." : 
             selectedMethod === 'CASH' ? "تأیید رزرو" : "پرداخت"}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isProcessing}
          >
            انصراف
          </Button>
        </div>

        {/* توضیحات */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• پس از پرداخت، نوبت شما به صورت خودکار رزرو می‌شود</p>
          <p>• در صورت پرداخت نقدی، لطفاً در زمان مقرر در محل حاضر شوید</p>
          <p>• در صورت بروز مشکل در پرداخت، با پشتیبانی تماس بگیرید</p>
        </div>
      </CardContent>
    </Card>
  );
}