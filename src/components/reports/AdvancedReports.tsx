/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/components/reports/AdvancedReports.tsx - آپدیت شده
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Download, Filter, BarChart3, Users, Calendar, DollarSign, Loader2, Building } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface Branch {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

export function AdvancedReports() {
  const [filters, setFilters] = useState({
    reportType: "appointments",
    dateRange: "30days",
    branchId: "all",
    serviceId: "all",
  });
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  const reportTypes = [
    { value: "appointments", label: "گزارش نوبت‌ها", icon: Calendar },
    { value: "revenue", label: "گزارش درآمد", icon: DollarSign },
    { value: "users", label: "گزارش کاربران", icon: Users },
    { value: "services", label: "گزارش سرویس‌ها", icon: BarChart3 },
  ];

  const dateRanges = [
    { value: "7days", label: "۷ روز گذشته" },
    { value: "30days", label: "۳۰ روز گذشته" },
    { value: "90days", label: "۳ ماه گذشته" },
  ];

  // دریافت شعبه‌ها و سرویس‌ها از API
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setIsLoadingData(true);
        const [branchesResponse, servicesResponse] = await Promise.all([
          fetch('/api/branches?active=true'),
          fetch('/api/services?active=true')
        ]);

        if (branchesResponse.ok && servicesResponse.ok) {
          const branchesData = await branchesResponse.json();
          const servicesData = await servicesResponse.json();
          
          setBranches(branchesData);
          setServices(servicesData);
        } else {
          throw new Error('خطا در دریافت داده‌های فیلتر');
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
        toast({
          title: "خطا",
          description: "خطا در دریافت لیست شعبه‌ها و سرویس‌ها",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchFilterData();
  }, [toast]);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/reports?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        toast({
          title: "موفق",
          description: "گزارش با موفقیت تولید شد",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error ?? 'خطا در تولید گزارش');
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message ?? "خطا در تولید گزارش",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      toast({
        title: "در حال آماده‌سازی",
        description: `خروجی ${format} در حال تولید است...`,
      });
      // شبیه‌سازی تولید خروجی
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "موفق",
        description: `خروجی ${format} با موفقیت تولید شد`,
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در خروجی گرفتن گزارش",
        variant: "destructive",
      });
    }
  };

  const renderChart = () => {
    if (!reportData?.chartData) return null;

    const data = reportData.chartData;

    switch (filters.reportType) {
      case 'revenue':
      case 'appointments':
      case 'users':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value) => [value.toLocaleString(), filters.reportType === 'revenue' ? 'درآمد' : filters.reportType === 'users' ? 'کاربران' : 'نوبت‌ها']}
              />
              <Line 
                type="monotone" 
                dataKey={filters.reportType === 'revenue' ? 'درآمد' : filters.reportType === 'users' ? 'کاربران' : 'نوبت‌ها'} 
                stroke="#3b82f6" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'services':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value.toLocaleString(), 'تعداد']} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2">در حال بارگذاری...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">گزارش‌گیری پیشرفته</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportReport('csv')}
            disabled={!reportData}
          >
            <Download className="ml-2 h-4 w-4" />
            خروجی CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportReport('pdf')}
            disabled={!reportData}
          >
            <Download className="ml-2 h-4 w-4" />
            خروجی PDF
          </Button>
        </div>
      </div>

      {/* فیلترها */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="ml-2 h-5 w-5" />
            فیلترهای گزارش
          </CardTitle>
          <CardDescription>
            برای تولید گزارش، فیلترهای مورد نظر خود را انتخاب کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع گزارش</label>
              <Select
                value={filters.reportType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع گزارش" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <type.icon className="ml-2 h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">بازه زمانی</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب بازه زمانی" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">شعبه</label>
              <Select
                value={filters.branchId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, branchId: value }))}
                disabled={branches.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={branches.length === 0 ? "در حال بارگذاری..." : "انتخاب شعبه"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center">
                      <Building className="ml-2 h-4 w-4" />
                      همه شعب
                    </div>
                  </SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      <div className="flex items-center">
                        <Building className="ml-2 h-4 w-4 text-muted-foreground" />
                        {branch.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {branches.length === 0 && (
                <p className="text-xs text-muted-foreground">هیچ شعبه‌ای یافت نشد</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">سرویس</label>
              <Select
                value={filters.serviceId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, serviceId: value }))}
                disabled={services.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={services.length === 0 ? "در حال بارگذاری..." : "انتخاب سرویس"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه سرویس‌ها</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {services.length === 0 && (
                <p className="text-xs text-muted-foreground">هیچ سرویسی یافت نشد</p>
              )}
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            className="mt-4"
            disabled={isLoading || branches.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال تولید...
              </>
            ) : (
              'تولید گزارش'
            )}
          </Button>

          {/* اطلاعات آماری */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1 space-x-reverse">
              <Building className="h-3 w-3" />
              <span>{branches.length} شعبه فعال</span>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <BarChart3 className="h-3 w-3" />
              <span>{services.length} سرویس فعال</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نتایج گزارش */}
      {reportData && (
        <div className="space-y-6">
          {/* خلاصه گزارش */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(reportData.summary).map(([key, value]) => (
              <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {getSummaryTitle(key)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {typeof value === 'number' ? value.toLocaleString() : String(value ?? '')}
                    {key.includes('Rate') && '%'}
                    {key.includes('Revenue') && ' تومان'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* نمودار */}
          <Card>
            <CardHeader>
              <CardTitle>نمودار گزارش</CardTitle>
              <CardDescription>
                نمایش گرافیکی داده‌های گزارش
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>

          {/* جزئیات */}
          <Card>
            <CardHeader>
              <CardTitle>جزئیات گزارش</CardTitle>
              <CardDescription>
                {reportData.details.length} مورد یافت شد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.details.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Badge variant="outline">
                        {item.date ? new Date(item.date).toLocaleDateString('fa-IR') : '---'}
                      </Badge>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.value}</p>
                      {item.change && (
                        <p className={`text-xs ${
                          item.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function getSummaryTitle(key: string): string {
  const titles: Record<string, string> = {
    totalRevenue: 'درآمد کل',
    totalAppointments: 'تعداد نوبت‌ها',
    averageRevenue: 'میانگین درآمد',
    dateRange: 'بازه زمانی',
    completedAppointments: 'نوبت‌های تکمیل شده',
    pendingAppointments: 'نوبت‌های در انتظار',
    cancellationRate: 'نرخ کنسلی',
    totalUsers: 'تعداد کاربران',
    activeUsers: 'کاربران فعال',
    conversionRate: 'نرخ تبدیل',
    totalServices: 'تعداد سرویس‌ها',
    mostPopularService: 'پرطرفدارترین سرویس'
  };
  
  return titles[key] ?? key;
}