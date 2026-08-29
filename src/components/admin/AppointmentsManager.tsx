// src/components/admin/AppointmentsManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { CheckCircle, XCircle, Eye, Clock, Calendar, User, Phone, Search, Filter } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { formatDate, formatTime } from "~/lib/utils";
import { Input } from "~/components/ui/input";

interface Appointment {
  id: string;
  date: string;
  status: string;
  notes?: string;
  cancellationReason?: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  service: {
    name: string;
    duration: number;
    price?: number;
  };
  branch: {
    name: string;
  };
  staff?: {
    name: string;
  };
}

export function AppointmentsManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/admin/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در دریافت لیست نوبت‌ها",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateAppointmentStatus = async (appointmentId: string, status: string, reason?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          ...(reason && { cancellationReason: reason })
        }),
      });

      if (response.ok) {
        toast({
          title: "موفق",
          description: `نوبت با موفقیت ${getStatusText(status)} شد`,
        });
        loadAppointments();
        setSelectedAppointment(null);
        setCancellationReason("");
      } else {
        throw new Error('خطا در بروزرسانی نوبت');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بروزرسانی نوبت",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'تأیید';
      case 'CANCELLED': return 'لغو';
      case 'COMPLETED': return 'تکمیل';
      default: return 'بروزرسانی';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return "secondary";
      case 'CONFIRMED': return "default";
      case 'COMPLETED': return "default";
      case 'CANCELLED': return "destructive";
      default: return "secondary";
    }
  };

  const getStatusTextPersian = (status: string) => {
    switch (status) {
      case 'PENDING': return 'در انتظار';
      case 'CONFIRMED': return 'تأیید شده';
      case 'COMPLETED': return 'تکمیل شده';
      case 'CANCELLED': return 'لغو شده';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.user.name.includes(searchQuery) || 
                          apt.service.name.includes(searchQuery) ||
                          apt.branch.name.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">مدیریت نوبت‌ها</h2>
          <p className="text-muted-foreground mt-1">
            مدیریت و تأیید نوبت‌های ثبت‌شده ({filteredAppointments.length} نوبت)
          </p>
        </div>
        <Button onClick={loadAppointments} variant="outline">
          <Clock className="ml-2 h-4 w-4" />
          بروزرسانی
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در نوبت‌ها، کاربران، سرویس‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار</option>
                <option value="CONFIRMED">تأیید شده</option>
                <option value="COMPLETED">تکمیل شده</option>
                <option value="CANCELLED">لغو شده</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">نوبتی یافت نشد</h3>
              <p className="text-muted-foreground">
                با فیلترهای انتخاب شده نوبتی مطابقت ندارد
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کاربر</TableHead>
                    <TableHead>سرویس</TableHead>
                    <TableHead>تاریخ و زمان</TableHead>
                    <TableHead>شعبه</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.user.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{appointment.user.phone || 'ندارد'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.service.duration} دقیقه
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(appointment.date)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.branch.name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(appointment.status)}>
                          {getStatusTextPersian(appointment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAppointment(appointment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl" dir="rtl">
                              <DialogHeader>
                                <DialogTitle>جزییات نوبت</DialogTitle>
                                <DialogDescription>
                                  اطلاعات کامل نوبت شماره {appointment.id}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>کاربر:</Label>
                                    <p className="font-medium">{appointment.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{appointment.user.email}</p>
                                    {appointment.user.phone && (
                                      <p className="text-sm text-muted-foreground">{appointment.user.phone}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label>سرویس:</Label>
                                    <p className="font-medium">{appointment.service.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {appointment.service.duration} دقیقه - 
                                      {appointment.service.price ? ` ${appointment.service.price.toLocaleString()} تومان` : ' رایگان'}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>تاریخ و زمان:</Label>
                                    <p className="font-medium">{formatDate(appointment.date)}</p>
                                    <p className="text-sm text-muted-foreground">{formatTime(appointment.date)}</p>
                                  </div>
                                  <div>
                                    <Label>شعبه:</Label>
                                    <p className="font-medium">{appointment.branch.name}</p>
                                  </div>
                                  {appointment.staff && (
                                    <div>
                                      <Label>پرسنل:</Label>
                                      <p className="font-medium">{appointment.staff.name}</p>
                                    </div>
                                  )}
                                  <div>
                                    <Label>وضعیت:</Label>
                                    <Badge variant={getStatusVariant(appointment.status)}>
                                      {getStatusTextPersian(appointment.status)}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {appointment.notes && (
                                  <div>
                                    <Label>یادداشت‌ها:</Label>
                                    <p className="text-sm bg-muted p-2 rounded">{appointment.notes}</p>
                                  </div>
                                )}

                                {appointment.cancellationReason && (
                                  <div>
                                    <Label>دلیل لغو:</Label>
                                    <p className="text-sm bg-red-50 p-2 rounded text-red-700">
                                      {appointment.cancellationReason}
                                    </p>
                                  </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                  {appointment.status === 'PENDING' && (
                                    <>
                                      <Button
                                        onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                                        disabled={isLoading}
                                      >
                                        <CheckCircle className="ml-2 h-4 w-4" />
                                        تأیید نوبت
                                      </Button>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="outline">
                                            <XCircle className="ml-2 h-4 w-4" />
                                            لغو نوبت
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>لغو نوبت</DialogTitle>
                                            <DialogDescription>
                                              دلیل لغو این نوبت را وارد کنید
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="reason">دلیل لغو</Label>
                                              <Textarea
                                                id="reason"
                                                value={cancellationReason}
                                                onChange={(e) => setCancellationReason(e.target.value)}
                                                placeholder="دلیل لغو نوبت را وارد کنید..."
                                              />
                                            </div>
                                            <Button
                                              variant="destructive"
                                              onClick={() => updateAppointmentStatus(appointment.id, 'CANCELLED', cancellationReason)}
                                              disabled={!cancellationReason || isLoading}
                                            >
                                              تأیید لغو
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </>
                                  )}
                                  
                                  {appointment.status === 'CONFIRMED' && (
                                    <Button
                                      onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                                      disabled={isLoading}
                                    >
                                      <CheckCircle className="ml-2 h-4 w-4" />
                                      تکمیل نوبت
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {appointment.status === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                                disabled={isLoading}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>لغو نوبت</DialogTitle>
                                    <DialogDescription>
                                      دلیل لغو این نوبت را وارد کنید
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="reason">دلیل لغو</Label>
                                      <Textarea
                                        id="reason"
                                        value={cancellationReason}
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                        placeholder="دلیل لغو نوبت را وارد کنید..."
                                      />
                                    </div>
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        setSelectedAppointment(appointment);
                                        updateAppointmentStatus(appointment.id, 'CANCELLED', cancellationReason);
                                      }}
                                      disabled={!cancellationReason || isLoading}
                                    >
                                      تأیید لغو
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}

                          {appointment.status === 'CONFIRMED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                              disabled={isLoading}
                            >
                              تکمیل
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
