// src/components/analytics/TremorDashboard.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, Title, Text, Metric, BarChart, LineChart, DonutChart } from "@tremor/react";
import { Calendar, Users, DollarSign, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

const valueFormatter = (number: number) => 
  new Intl.NumberFormat('fa-IR').format(number).toString();

const currencyFormatter = (number: number) => 
  new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency: 'IRR'
  }).format(number);

export function TremorDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('خطا در دریافت آمار');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const chartData = stats?.monthlyData || [];
  const serviceDistribution = stats?.serviceDistribution || [];
  const statusDistribution = stats?.statusDistribution || [];

  return (
    <div className="space-y-6">
      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card decoration="top" decorationColor="blue" className="hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl ml-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <Text>کل نوبت‌ها</Text>
              <Metric className="text-blue-600">{valueFormatter(stats?.totalAppointments || 0)}</Metric>
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor="emerald" className="hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-xl ml-3">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <Text>کاربران فعال</Text>
              <Metric className="text-emerald-600">{valueFormatter(stats?.activeUsers || 0)}</Metric>
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor="amber" className="hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-xl ml-3">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <Text>درآمد ماه</Text>
              <Metric className="text-amber-600">{currencyFormatter(stats?.monthlyRevenue || 0)}</Metric>
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor="violet" className="hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-violet-100 rounded-xl ml-3">
              <CheckCircle className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <Text>نوبت‌های تکمیل شده</Text>
              <Metric className="text-violet-600">{valueFormatter(stats?.completedAppointments || 0)}</Metric>
            </div>
          </div>
        </Card>
      </div>

      {/* نمودارها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title>روند نوبت‌ها</Title>
              <Text>تعداد نوبت‌های ثبت‌شده در ۶ ماه گذشته</Text>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <LineChart
            className="mt-4"
            data={chartData}
            index="month"
            categories={["نوبت‌ها"]}
            colors={["blue"]}
            valueFormatter={valueFormatter}
            yAxisWidth={40}
          />
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title>توزیع سرویس‌ها</Title>
              <Text>پرطرفدارترین سرویس‌ها</Text>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <DonutChart
            className="mt-4"
            data={serviceDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
          />
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title>وضعیت نوبت‌ها</Title>
              <Text>توزیع نوبت‌ها بر اساس وضعیت</Text>
            </div>
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <DonutChart
            className="mt-4"
            data={statusDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["amber", "emerald", "red", "blue"]}
          />
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title>درآمد ماهانه</Title>
              <Text>میزان درآمد بر اساس ماه (هزار تومان)</Text>
            </div>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
          <BarChart
            className="mt-4"
            data={chartData}
            index="month"
            categories={["درآمد"]}
            colors={["emerald"]}
            valueFormatter={(value) => currencyFormatter(value / 1000)}
            yAxisWidth={40}
          />
        </Card>
      </div>

      {/* آمار سریع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <Text>میانگین رضایت</Text>
              <Metric className="text-blue-600">{stats?.avgSatisfaction || 0}/5</Metric>
            </div>
          </div>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <Text>نرخ کنسلی</Text>
              <Metric className="text-red-600">%{stats?.cancellationRate || 0}</Metric>
            </div>
          </div>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <Text>نوبت‌های امروز</Text>
              <Metric className="text-emerald-600">{stats?.todayAppointments || 0}</Metric>
            </div>
          </div>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <Text>شعب فعال</Text>
              <Metric className="text-violet-600">{stats?.activeBranches || 0}</Metric>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
