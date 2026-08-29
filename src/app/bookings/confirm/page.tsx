/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
// src/app/bookings/confirm/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "~/components/shared/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CheckCircle, Clock, MapPin, User, Calendar } from "lucide-react";
import Link from "next/link";

interface Appointment {
  id: string;
  date: string;
  status: string;
  service: {
    name: string;
    duration: number;
    price: number | null;
  };
  branch: {
    name: string;
    address: string;
  };
  staff?: {
    name: string;
  };
}

export default function BookingConfirmPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id');

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (!appointmentId) {
      router.push("/bookings");
      return;
    }

    const loadAppointment = async () => {
      try {
        const response = await fetch(`/api/appointments/${appointmentId}`);
        if (response.ok) {
          const appointmentData = await response.json();
          setAppointment(appointmentData);
        } else {
          const errorText = await response.text(); // متن خطای سرور را می‌خوانیم
      console.error("API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Server Error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error loading appointment:', error);
        router.push("/bookings");
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointment();
  }, [appointmentId, router, status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">نوبت یافت نشد</p>
          </div>
        </div>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.date);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl mb-2">نوبت شما با موفقیت رزرو شد!</CardTitle>
              <CardDescription className="text-lg">
                شماره نوبت: {appointment.id}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>مشخصات نوبت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">تاریخ و زمان</div>
                  <div className="text-sm text-gray-600">
                    {appointmentDate.toLocaleDateString('fa-IR')} -{' '}
                    {appointmentDate.toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 space-x-reverse">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">سرویس</div>
                  <div className="text-sm text-gray-600">
                    {appointment.service.name} ({appointment.service.duration} دقیقه)
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 space-x-reverse">
                <MapPin className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium">شعبه</div>
                  <div className="text-sm text-gray-600">
                    {appointment.branch.name}
                    <br />
                    {appointment.branch.address}
                  </div>
                </div>
              </div>

              {appointment.staff && (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <User className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium">پرسنل</div>
                    <div className="text-sm text-gray-600">{appointment.staff.name}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-white text-xs">و</span>
                </div>
                <div>
                  <div className="font-medium">وضعیت</div>
                  <div className="text-sm text-gray-600">
                    {appointment.status === 'PENDING' && 'در انتظار تأیید'}
                    {appointment.status === 'CONFIRMED' && 'تأیید شده'}
                    {appointment.status === 'COMPLETED' && 'تکمیل شده'}
                    {appointment.status === 'CANCELLED' && 'لغو شده'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-6">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full">
                مشاهده پنل کاربری
              </Button>
            </Link>
            <Link href="/bookings" className="flex-1">
              <Button variant="outline" className="w-full">
                رزرو نوبت جدید
              </Button>
            </Link>
          </div>

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">نکات مهم:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>لطفاً ۱۵ دقیقه قبل از زمان نوبت در محل حاضر باشید</li>
                  <li>در صورت نیاز به لغو نوبت، حداقل ۲۴ ساعت قبل اقدام کنید</li>
                  <li>می‌توانید از پنل کاربری وضعیت نوبت خود را پیگیری کنید</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}