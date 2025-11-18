/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/components/appointments/AppointmentsList.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Calendar, Clock, MapPin, User, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useToast } from "~/hooks/use-toast";
import { formatDate, formatTime } from "~/lib/utils";

interface Appointment {
  id: string;
  date: string;
  status: string;
  notes?: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  branch: {
    id: string;
    name: string;
    address: string;
  };
  staff?: {
    id: string;
    name: string;
    specialty: string;
  };
}

interface AppointmentsListProps {
  initialAppointments: Appointment[];
}

export function AppointmentsList({ initialAppointments }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const refreshAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data);
        toast({
          title: "بروزرسانی شد",
          description: "لیست نوبت‌ها با موفقیت بروزرسانی شد",
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بروزرسانی نوبت‌ها",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm("آیا از لغو این نوبت اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED'
        }),
      });

      if (response.ok) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'CANCELLED' }
              : apt
          )
        );
        toast({
          title: "موفق",
          description: "نوبت با موفقیت لغو شد",
        });
      } else {
        throw new Error('خطا در لغو نوبت');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در لغو نوبت",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "secondary",
      CONFIRMED: "default",
      COMPLETED: "outline",
      CANCELLED: "destructive"
    } as const;

    const labels = {
      PENDING: "در انتظار تأیید",
      CONFIRMED: "تأیید شده",
      COMPLETED: "تکمیل شده",
      CANCELLED: "لغو شده"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">کل نوبت‌ها</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تأیید شده</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'CONFIRMED').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">در انتظار</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'PENDING').length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تکمیل شده</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'COMPLETED').length}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>لیست نوبت‌ها</CardTitle>
              <CardDescription>
                تمام نوبت‌های گذشته و آینده شما - {appointments.length} نوبت
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAppointments}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              بروزرسانی
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز نوبتی ندارید</h3>
              <p className="text-muted-foreground mb-6">
                اولین نوبت خود را رزرو کنید تا اینجا نمایش داده شود
              </p>
              <Link href="/bookings">
                <Button>
                  رزرو نوبت جدید
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4 space-x-reverse flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' :
                      appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                      appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 space-x-reverse mb-1">
                        <h3 className="font-semibold">{appointment.service.name}</h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 ml-1" />
                          <span>
                            {formatDate(appointment.date)} - {formatTime(appointment.date)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 ml-1" />
                          <span>{appointment.branch.name}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-3 w-3 ml-1" />
                          <span>
                            {appointment.staff ? appointment.staff.name : 'هر پرسنل موجود'}
                            {appointment.staff?.specialty && ` (${appointment.staff.specialty})`}
                          </span>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      جزئیات
                    </Button>
                    {appointment.status === 'PENDING' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => cancelAppointment(appointment.id)}
                      >
                        لغو نوبت
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}