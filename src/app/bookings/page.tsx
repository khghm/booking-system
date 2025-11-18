/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/bookings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Calendar } from "~/components/ui/calendar";
import { useToast } from "~/hooks/use-toast";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { faIR } from "date-fns/locale";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface Branch {
  id: string;
  name: string;
  address: string;
}

interface Staff {
  id: string;
  name: string;
  specialty: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load initial data
  useEffect(() => {
    if (status === "authenticated") {
      loadInitialData();
    }
  }, [status]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      console.log('Loading initial data...');
      
      const [servicesRes, branchesRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/branches")
      ]);

      console.log('Services response:', servicesRes.status, servicesRes.ok);
      console.log('Branches response:', branchesRes.status, branchesRes.ok);

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        console.log('Services data:', servicesData);
        setServices(servicesData);
      } else {
        console.error('Services API error:', servicesRes.statusText);
      }

      if (branchesRes.ok) {
        const branchesData = await branchesRes.json();
        console.log('Branches data:', branchesData);
        setBranches(branchesData);
      } else {
        console.error('Branches API error:', branchesRes.statusText);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری داده‌ها",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadStaff = async (branchId: string) => {
    try {
      console.log('Loading staff for branch:', branchId);
      const response = await fetch(`/api/staff?branchId=${branchId}`);
      console.log('Staff response:', response.status, response.ok);
      
      if (response.ok) {
        const staffData = await response.json();
        console.log('Staff data:', staffData);
        setStaff(staffData);
      } else {
        console.error('Staff API error:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری پرسنل",
        variant: "destructive",
      });
    }
  };

  const loadTimeSlots = async (date: Date, staffId?: string) => {
    if (!selectedService || !selectedBranch) return;

    try {
      const dateStr = format(date, "yyyy-MM-dd");
      console.log('Loading time slots for:', { dateStr, selectedService, selectedBranch, staffId });
      
      const response = await fetch(
        `/api/appointments/slots?date=${dateStr}&serviceId=${selectedService}&branchId=${selectedBranch}&staffId=${staffId || ""}`
      );

      console.log('Time slots response:', response.status, response.ok);

      if (response.ok) {
        const slotsData = await response.json();
        console.log('Time slots data:', slotsData);
        setTimeSlots(slotsData.data || []);
      } else {
        console.error('Time slots API error:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری زمان‌های موجود",
        variant: "destructive",
      });
    }
  };

  const handleBranchChange = (branchId: string) => {
    console.log('Branch selected:', branchId);
    setSelectedBranch(branchId);
    setSelectedStaff("");
    setStaff([]);
    if (branchId) {
      loadStaff(branchId);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    console.log('Date selected:', date);
    setSelectedDate(date);
    setSelectedTime("");
    if (date) {
      loadTimeSlots(date, selectedStaff);
    }
  };

 const handleStaffChange = (staffId: string) => {
    // ⬇️ تغییر: تبدیل مقدار "unassigned" به "" 
    const finalStaffId = staffId === "unassigned" ? "" : staffId;
    
    console.log('Staff selected:', finalStaffId);
    setSelectedStaff(finalStaffId); // ⬅️ تنظیم مقدار "" یا ID واقعی
    setSelectedTime("");
    if (selectedDate) {
      loadTimeSlots(selectedDate, finalStaffId); // ⬅️ ارسال "" یا ID واقعی
    }
  };

  // src/app/bookings/page.tsx - آپدیت تابع handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (!selectedDate || !selectedTime) {
      throw new Error("لطفا تاریخ و زمان را انتخاب کنید");
    }

    // ساخت تاریخ کامل از تاریخ و زمان انتخاب شده
    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    console.log("ارسال داده‌ها به API:", {
      serviceId: selectedService,
      branchId: selectedBranch,
      staffId: selectedStaff,
      date: appointmentDateTime.toISOString(),
      notes: notes,
    });

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serviceId: selectedService,
        branchId: selectedBranch,
        staffId: selectedStaff || null,
        date: appointmentDateTime.toISOString(),
        notes: notes,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("خطای API:", responseData);
      throw new Error(responseData.error || "خطا در رزرو نوبت");
    }

    console.log("نوبت با موفقیت ایجاد شد:", responseData);
    
    toast({
      title: "موفق",
      description: "نوبت شما با موفقیت رزرو شد",
    });

    // هدایت به صفحه پرداخت یا نوبت‌ها
    router.push("/dashboard/appointments");

  } catch (error: any) {
    console.error("خطای کامل:", error);
    toast({
      title: "خطا",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};  
  const selectedServiceObj = services.find(s => s.id === selectedService);
  const selectedBranchObj = branches.find(b => b.id === selectedBranch);
  const selectedStaffObj = staff.find(s => s.id === selectedStaff);

  if (status === "loading" || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
            {loadingData && (
              <p className="text-sm text-gray-500 mt-2">
                بارگذاری سرویس‌ها و شعب...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">رزرو نوبت</h1>
          <p className="text-muted-foreground mt-2">
            نوبت مورد نظر خود را انتخاب و رزرو کنید
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-12 h-1 ${
                      step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "انتخاب سرویس و شعبه"}
              {step === 2 && "انتخاب پرسنل"}
              {step === 3 && "انتخاب تاریخ و زمان"}
              {step === 4 && "تأیید نهایی"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "سرویس و شعبه مورد نظر خود را انتخاب کنید"}
              {step === 2 && "پرسنل مورد نظر خود را انتخاب کنید (اختیاری)"}
              {step === 3 && "تاریخ و زمان مناسب را انتخاب کنید"}
              {step === 4 && "اطلاعات نوبت را بررسی و تأیید کنید"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Service and Branch Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="service">انتخاب سرویس</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="سرویس مورد نظر را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.length === 0 ? (
                          <SelectItem value="no-data" disabled>
                            هیچ سرویسی یافت نشد
                          </SelectItem>
                        ) : (
                          services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              <div className="flex justify-between items-center w-full">
                                <span>{service.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {service.duration} دقیقه - {service.price?.toLocaleString()} تومان
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {services.length === 0 && (
                      <p className="text-sm text-red-600">
                        هیچ سرویس فعالی در سیستم وجود ندارد. لطفاً با مدیر سیستم تماس بگیرید.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="branch">انتخاب شعبه</Label>
                    <Select value={selectedBranch} onValueChange={handleBranchChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="شعبه مورد نظر را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.length === 0 ? (
                          <SelectItem value="no-data" disabled>
                            هیچ شعبه‌ای یافت نشد
                          </SelectItem>
                        ) : (
                          branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              <div>
                                <div className="font-medium">{branch.name}</div>
                                <div className="text-sm text-muted-foreground">{branch.address}</div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {branches.length === 0 && (
                      <p className="text-sm text-red-600">
                        هیچ شعبه فعالی در سیستم وجود ندارد. لطفاً با مدیر سیستم تماس بگیرید.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <div></div>
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!selectedService || !selectedBranch}
                    >
                      ادامه
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Staff Selection */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="staff">انتخاب پرسنل (اختیاری)</Label>
                    <Select value={selectedStaff} onValueChange={handleStaffChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="پرسنل مورد نظر را انتخاب کنید (اختیاری)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">هر پرسنل موجود</SelectItem>
                        {staff.length === 0 ? (
                          <SelectItem value="no-staff" disabled>
                            هیچ پرسنلی برای این شعبه یافت نشد
                          </SelectItem>
                        ) : (
                          staff.map((staffMember) => (
                            <SelectItem key={staffMember.id} value={staffMember.id}>
                              <div>
                                <div className="font-medium">{staffMember.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {staffMember.specialty}
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      بازگشت
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                    >
                      ادامه
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Date and Time Selection */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>انتخاب تاریخ</Label>
                    <div className="border rounded-lg p-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        disabled={(date) => isBefore(date, startOfToday())}
                        locale={faIR}
                        className="mx-auto"
                      />
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="space-y-3">
                      <Label>انتخاب زمان</Label>
                      {timeSlots.length === 0 ? (
                        <div className="text-center py-8 border rounded-lg bg-gray-50">
                          <p className="text-muted-foreground">
                            در حال بارگذاری زمان‌های موجود...
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {timeSlots.map((slot) => (
                            <Button
                              key={slot.time}
                              type="button"
                              variant={selectedTime === slot.time ? "default" : "outline"}
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className="h-12"
                            >
                              {slot.time}
                              {!slot.available && (
                                <span className="text-xs text-red-500 mr-1">✗</span>
                              )}
                            </Button>
                          ))}
                        </div>
                      )}
                      {timeSlots.length > 0 && timeSlots.every(slot => !slot.available) && (
                        <p className="text-center text-red-600 py-4">
                          متأسفانه هیچ زمان خالی برای این تاریخ وجود ندارد
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label htmlFor="notes">توضیحات (اختیاری)</Label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="توضیحات یا درخواست‌های خاص خود را اینجا بنویسید..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      بازگشت
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(4)}
                      disabled={!selectedDate || !selectedTime}
                    >
                      ادامه
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-lg">خلاصه نوبت</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">سرویس:</span>
                        <p className="font-medium">{selectedServiceObj?.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">مدت زمان:</span>
                        <p className="font-medium">{selectedServiceObj?.duration} دقیقه</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">شعبه:</span>
                        <p className="font-medium">{selectedBranchObj?.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedBranchObj?.address}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">پرسنل:</span>
                        <p className="font-medium">
                          {selectedStaffObj ? selectedStaffObj.name : "هر پرسنل موجود"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">تاریخ:</span>
                        <p className="font-medium">
                          {selectedDate && format(selectedDate, "EEEE, d MMMM yyyy", { locale: faIR })}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">زمان:</span>
                        <p className="font-medium">{selectedTime}</p>
                      </div>
                      {notes && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">توضیحات:</span>
                          <p className="font-medium">{notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>
                      بازگشت
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "در حال رزرو..." : "تأیید و رزرو نوبت"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">اطلاعات دیباگ:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>سرویس‌ها: {services.length} مورد</div>
            <div>شعب: {branches.length} مورد</div>
            <div>پرسنل: {staff.length} مورد</div>
            <div>زمان‌ها: {timeSlots.length} مورد</div>
          </div>
        </div>
      </div>
    </div>
  );
}