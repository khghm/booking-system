/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/bookings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Calendar } from "~/components/ui/calendar";
import { Badge } from "~/components/ui/badge";
import { Header } from "~/components/shared/Header";
import { ChatWidget } from "~/components/chat/ChatWidget";
import { useToast } from "~/hooks/use-toast";
import { formatDate, formatTime } from "~/lib/utils";
import { CalendarIcon, Clock, MapPin, User, CreditCard, ChevronRight, ChevronLeft } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number | null;
  color: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
}

interface Staff {
  id: string;
  name: string;
  specialty?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // مراحل: 1=سرویس/شعبه، 2=پرسنل، 3=تاریخ/زمان، 4=تایید
  const [step, setStep] = useState(1);
  
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [formData, setFormData] = useState({
    serviceId: "",
    branchId: "",
    staffId: "", // می‌تواند خالی باشد
    date: "",
    time: "",
    notes: ""
  });

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
      const [servicesRes, branchesRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/branches?active=true')
      ]);

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }

      if (branchesRes.ok) {
        const branchesData = await branchesRes.json();
        setBranches(branchesData);
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری داده‌ها",
        variant: "destructive",
      });
    }
  };

  const loadStaff = async (branchId: string) => {
    try {
      setStaff([]); // پاک کردن لیست قبلی
      const response = await fetch(`/api/staff?branchId=${branchId}`);
      if (response.ok) {
        const staffData = await response.json();
        setStaff(staffData);
      }
    } catch (error) {
      // خطا را نشان نمی‌دهیم چون پرسنل اختیاری است و شاید شعبه پرسنل خاصی نداشته باشد
      console.error("Error loading staff:", error);
    }
  };

  const loadTimeSlots = async (date: Date, serviceId: string, branchId: string, staffId?: string) => {
    try {
      setTimeSlots([]);
      const params = new URLSearchParams({
        date: date.toISOString(),
        serviceId,
        branchId,
        ...(staffId && { staffId })
      });

      const response = await fetch(`/api/appointments/slots?${params}`);
      if (response.ok) {
        const slots = await response.json();
        setTimeSlots(slots);
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری زمان‌های موجود",
        variant: "destructive",
      });
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setFormData(prev => ({ ...prev, serviceId }));
  };

  const handleBranchSelect = async (branchId: string) => {
    setFormData(prev => ({ ...prev, branchId, staffId: "" }));
    // به محض انتخاب شعبه، پرسنل آن را لود می‌کنیم
    await loadStaff(branchId);
  };

  const handleStaffSelect = (staffId: string) => {
    setFormData(prev => ({ ...prev, staffId }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, time: "" })); // ریست کردن ساعت با تغییر روز
    
    if (date && formData.serviceId && formData.branchId) {
      const dateString = date.toISOString();
      setFormData(prev => ({ ...prev, date: dateString }));
      loadTimeSlots(date, formData.serviceId, formData.branchId, formData.staffId);
    }
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
    // بعد از انتخاب زمان، اتوماتیک به مرحله تایید نرویم تا کاربر مطمئن شود
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.serviceId || !formData.branchId) {
        toast({ title: "خطا", description: "لطفاً سرویس و شعبه را انتخاب کنید", variant: "destructive" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // پرسنل اختیاری است، پس چک نمی‌کنیم
      // اگر بخواهیم زمان‌های امروز را پیش‌فرض لود کنیم:
      const today = new Date();
      setSelectedDate(today);
      handleDateSelect(today);
      setStep(3);
    } else if (step === 3) {
      if (!formData.date || !formData.time) {
        toast({ title: "خطا", description: "لطفاً تاریخ و ساعت را انتخاب کنید", variant: "destructive" });
        return;
      }
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        toast({
          title: "موفق",
          description: "نوبت شما با موفقیت رزرو شد",
        });

        // دریافت ID صحیح از پاسخ
        const validId = responseData.appointment?.id ?? responseData.id;

        if (validId) {
            router.push(`/bookings/confirm?id=${validId}`);
        } else {
            throw new Error("شناسه نوبت یافت نشد");
        }
      } else {
        const error = await response.json();
        throw new Error(error.error ?? "خطا در رزرو نوبت");
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === formData.serviceId);
  const selectedBranch = branches.find(b => b.id === formData.branchId);
  const selectedStaff = staff.find(s => s.id === formData.staffId);

  if (status === "loading") {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">در حال بارگذاری...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">رزرو نوبت آنلاین</h1>
          <p className="text-gray-600">مراحل زیر را برای دریافت نوبت طی کنید</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                   {step === 1 && "مرحله ۱: انتخاب خدمات"}
                   {step === 2 && "مرحله ۲: انتخاب کارشناس"}
                   {step === 3 && "مرحله ۳: انتخاب زمان"}
                   {step === 4 && "مرحله ۴: تأیید نهایی"}
                </CardTitle>
                <CardDescription>
                  {step === 2 ? "انتخاب کارشناس اختیاری است" : "اطلاعات مورد نیاز را وارد کنید"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* استپر */}
                <div className="flex justify-between mb-8 relative">
                  {[1, 2, 3, 4].map((stepNumber) => (
                    <div key={stepNumber} className="flex flex-col items-center z-10">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-300
                        ${step >= stepNumber ? 'bg-blue-600' : 'bg-gray-300'}
                      `}>
                        {stepNumber}
                      </div>
                      <span className="text-xs mt-2 text-gray-600 hidden sm:block">
                        {stepNumber === 1 && 'خدمات'}
                        {stepNumber === 2 && 'پرسنل'}
                        {stepNumber === 3 && 'زمان'}
                        {stepNumber === 4 && 'تأیید'}
                      </span>
                    </div>
                  ))}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 -z-10">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${((step - 1) / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* --- مرحله ۱: سرویس و شعبه --- */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-3">
                        <Label>انتخاب سرویس *</Label>
                        <Select value={formData.serviceId} onValueChange={handleServiceSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="نوع سرویس را انتخاب کنید" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex items-center justify-between w-full gap-4">
                                  <span>{service.name}</span>
                                  {service.price && (
                                    <Badge variant="secondary">{service.price.toLocaleString()} تومان</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>انتخاب شعبه *</Label>
                        <Select value={formData.branchId} onValueChange={handleBranchSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="شعبه مورد نظر را انتخاب کنید" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span>{branch.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* --- مرحله ۲: انتخاب پرسنل --- */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-3">
                        <Label>انتخاب کارشناس (اختیاری)</Label>
                        {staff.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* گزینه انتخاب خودکار / بدون پرسنل */}
                            <div 
                              className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-400 ${!formData.staffId ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200'}`}
                              onClick={() => handleStaffSelect("")}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <div>
                                  <div className="font-medium">هر کارشناسی</div>
                                  <div className="text-sm text-gray-500">انتخاب بر اساس اولین وقت خالی</div>
                                </div>
                              </div>
                            </div>

                            {/* لیست پرسنل */}
                            {staff.map((person) => (
                              <div 
                                key={person.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-400 ${formData.staffId === person.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200'}`}
                                onClick={() => handleStaffSelect(person.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="font-bold text-blue-600">{person.name.charAt(0)}</span>
                                  </div>
                                  <div>
                                    <div className="font-medium">{person.name}</div>
                                    {person.specialty && (
                                      <div className="text-sm text-gray-500">{person.specialty}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                            <User className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500">برای این شعبه کارشناس خاصی تعریف نشده است.</p>
                            <p className="text-sm text-gray-400 mt-1">می‌توانید به مرحله بعد بروید.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* --- مرحله ۳: تقویم و زمان --- */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label>انتخاب تاریخ *</Label>
                          <div className="border rounded-lg p-4 flex justify-center">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today || date.getDay() === 5; // جمعه تعطیل
                              }}
                              className="rounded-md"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>زمان‌های موجود *</Label>
                          {selectedDate ? (
                            timeSlots.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                                {timeSlots.map((slot, index) => (
                                  <Button
                                    key={index}
                                    type="button"
                                    variant={formData.time === slot.time ? "default" : "outline"}
                                    disabled={!slot.available}
                                    onClick={() => handleTimeSelect(slot.time)}
                                    className={`h-10 text-sm ${!slot.available ? 'opacity-50' : ''}`}
                                  >
                                    {formatTime(new Date(slot.time))}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12 border rounded-lg bg-gray-50">
                                <p className="text-gray-500">هیچ نوبتی برای این تاریخ موجود نیست.</p>
                              </div>
                            )
                          ) : (
                            <div className="text-center py-12 border rounded-lg bg-gray-50">
                              <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-gray-500">لطفاً یک تاریخ انتخاب کنید</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- مرحله ۴: تایید نهایی --- */}
                  {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          خلاصه سفارش
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between py-2 border-b border-blue-100">
                            <span className="text-gray-600">سرویس:</span>
                            <span className="font-medium">{selectedService?.name}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-blue-100">
                            <span className="text-gray-600">شعبه:</span>
                            <span className="font-medium">{selectedBranch?.name}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-blue-100">
                            <span className="text-gray-600">کارشناس:</span>
                            <span className="font-medium">
                                {selectedStaff ? selectedStaff.name : "هر کارشناسی (خودکار)"}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-blue-100">
                            <span className="text-gray-600">تاریخ و ساعت:</span>
                            <span className="font-medium dir-ltr">
                              {selectedDate && formatDate(selectedDate)} - {formData.time && formatTime(new Date(formData.time))}
                            </span>
                          </div>
                          {selectedService?.price && (
                            <div className="flex justify-between py-2 pt-4">
                              <span className="text-gray-800 font-bold">مبلغ قابل پرداخت:</span>
                              <span className="font-bold text-lg text-green-600">
                                {selectedService.price.toLocaleString()} تومان
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">توضیحات تکمیلی (اختیاری)</Label>
                        <textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="نکته خاصی مد نظر دارید؟"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* --- دکمه‌های نویگیشن --- */}
                  <div className="flex items-center justify-between pt-4 border-t mt-6">
                    {/* دکمه بازگشت */}
                    <div>
                      {step > 1 && (
                        <Button type="button" variant="outline" onClick={handlePrevStep} className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4" />
                          مرحله قبل
                        </Button>
                      )}
                    </div>

                    {/* دکمه ادامه / ثبت */}
                    <div>
                      {step < 4 ? (
                        <Button 
                          type="button" 
                          onClick={(e) => {
        // حتماً جلوی رفتار پیش‌فرض فرم را بگیرید
        e.preventDefault(); 
        
        // سپس منطق رفتن به مرحله بعد را اجرا کنید
        handleNextStep();
      }}
                          disabled={
                            (step === 1 && (!formData.serviceId || !formData.branchId)) ||
                            (step === 3 && (!formData.date || !formData.time))
                          }
                          className="flex items-center gap-2 pl-6"
                        >
                           {step === 2 ? "ادامه (انتخاب زمان)" : "مرحله بعد"}
                           <ChevronLeft className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                          {loading ? "در حال ثبت..." : "تأیید نهایی و رزرو"}
                        </Button>
                      )}
                    </div>
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>

          {/* سایدبار (خلاصه وضعیت لحظه‌ای) */}
          <div className="space-y-6 hidden lg:block">
             <Card className="sticky top-24">
                <CardHeader>
                   <CardTitle className="text-lg">جزئیات انتخاب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {selectedService ? (
                      <div className="text-sm border-l-2 border-blue-500 pl-3">
                         <div className="text-gray-500 text-xs">سرویس</div>
                         <div className="font-medium">{selectedService.name}</div>
                      </div>
                   ) : <div className="text-gray-400 text-sm">سرویس انتخاب نشده</div>}

                   {selectedBranch ? (
                      <div className="text-sm border-l-2 border-green-500 pl-3">
                         <div className="text-gray-500 text-xs">شعبه</div>
                         <div className="font-medium">{selectedBranch.name}</div>
                      </div>
                   ) : <div className="text-gray-400 text-sm">شعبه انتخاب نشده</div>}

                   {step > 2 && (
                      <div className="text-sm border-l-2 border-purple-500 pl-3">
                         <div className="text-gray-500 text-xs">کارشناس</div>
                         <div className="font-medium">{selectedStaff ? selectedStaff.name : "مهم نیست"}</div>
                      </div>
                   )}
                </CardContent>
             </Card>
          </div>

        </div>
      </div>
      <ChatWidget />
    </div>
  );
}