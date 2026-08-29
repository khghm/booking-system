"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Calendar, Clock, MapPin, User, Phone, CreditCard } from "lucide-react";
import { formatDate, formatTime } from "~/lib/utils";

interface Appointment {
  id: string;
  date: string;
  status: string;
  notes?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: Date | null;
  service: {
    name: string;
    duration: number;
    price?: number | null;
  };
  branch: {
    name: string;
    address?: string;
  };
  staff?: {
    name: string;
    specialty?: string | null;
  } | null;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
  invoice?: {
    status: string;
    total: number;
  };
}

interface AppointmentsListClientProps {
  appointments: Appointment[];
}

export function AppointmentsListClient({ appointments }: AppointmentsListClientProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelAppointment = async (appointmentId: string) => {
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('خطا در لغو نوبت');
      }
    } catch (error) {
      alert('خطا در لغو نوبت');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
      PENDING: "secondary",
      CONFIRMED: "default",
      COMPLETED: "outline",
      CANCELLED: "destructive"
    };
    const labels: Record<string, string> = {
      PENDING: "در انتظار تأیید",
      CONFIRMED: "تأیید شده",
      COMPLETED: "تکمیل شده",
      CANCELLED: "لغو شده"
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const openDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  return (
    <>
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
              <Button variant="outline" size="sm" onClick={() => openDetails(appointment)}>
                جزئیات
              </Button>
              {appointment.status === 'PENDING' && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleCancelAppointment(appointment.id)}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'در حال لغو...' : 'لغو نوبت'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>جزییات نوبت</DialogTitle>
            <DialogDescription>
              اطلاعات کامل نوبت
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">کاربر</label>
                  <p className="font-medium">{selectedAppointment.user?.name || 'نامشخص'}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.user?.email}</p>
                  {selectedAppointment.user?.phone && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Phone className="h-3 w-3 ml-1" />
                      {selectedAppointment.user.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">سرویس</label>
                  <p className="font-medium">{selectedAppointment.service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.service.duration} دقیقه
                    {selectedAppointment.service.price ? ` - ${selectedAppointment.service.price.toLocaleString()} تومان` : ' - رایگان'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">تاریخ و زمان</label>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 ml-1" />
                    {formatDate(selectedAppointment.date)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 ml-1" />
                    {formatTime(selectedAppointment.date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">شعبه</label>
                  <p className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 ml-1" />
                    {selectedAppointment.branch.name}
                  </p>
                  {selectedAppointment.branch.address && (
                    <p className="text-sm text-muted-foreground">{selectedAppointment.branch.address}</p>
                  )}
                </div>
                {selectedAppointment.staff && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">پرسنل</label>
                    <p className="font-medium">{selectedAppointment.staff.name}</p>
                    {selectedAppointment.staff.specialty && (
                      <p className="text-sm text-muted-foreground">{selectedAppointment.staff.specialty}</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">وضعیت</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
                {selectedAppointment.invoice && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">پرداخت</label>
                    <p className="font-medium flex items-center">
                      <CreditCard className="h-4 w-4 ml-1" />
                      {selectedAppointment.invoice.status === 'PAID' ? 'پرداخت شده' : 'در انتظار پرداخت'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.invoice.total.toLocaleString()} تومان
                    </p>
                  </div>
                )}
              </div>

              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">یادداشت‌ها</label>
                  <p className="text-sm bg-muted p-3 rounded-lg mt-1">{selectedAppointment.notes}</p>
                </div>
              )}

              {selectedAppointment.cancellationReason && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">دلیل لغو</label>
                  <p className="text-sm bg-red-50 p-3 rounded-lg mt-1 text-red-700">
                    {selectedAppointment.cancellationReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
