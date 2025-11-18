/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/components/loyalty/LoyaltyDashboard.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Gift, Star, Users, TrendingUp } from "lucide-react";

export function LoyaltyDashboard() {
  const { data: loyaltyData, isLoading } = useQuery({
    queryKey: ['loyalty'],
    queryFn: async () => {
      const response = await fetch('/api/loyalty');
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات وفاداری');
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8">در حال بارگذاری...</div>;
  }

    function handleRedeem(id: any): void {
        throw new Error("Function not implemented.");
    }

  return (
    <div className="space-y-6">
      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">امتیاز شما</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyData?.userPoints?.points || 0}</div>
            <p className="text-xs text-muted-foreground">
              امتیاز قابل استفاده
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">جمع امتیازات</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyData?.userPoints?.totalEarned || 0}</div>
            <p className="text-xs text-muted-foreground">
              امتیاز کسب شده در کل
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">دوستان دعوت شده</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyData?.referralCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              از طریق لینک دعوت
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">پاداش‌ها</CardTitle>
            <Gift className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyData?.availableRewards || 0}</div>
            <p className="text-xs text-muted-foreground">
              پاداش قابل دریافت
            </p>
          </CardContent>
        </Card>
      </div>

      {/* پاداش‌های موجود */}
      <Card>
        <CardHeader>
          <CardTitle>پاداش‌های قابل دریافت</CardTitle>
          <CardDescription>
            امتیازهای خود را با پاداش‌های ویژه معاوضه کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loyaltyData?.rewards?.map((reward: any) => (
              <Card key={reward.id} className="relative">
                <CardHeader>
                  <CardTitle className="text-lg">{reward.name}</CardTitle>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <Badge variant="secondary" className="text-sm">
                      {reward.pointsCost} امتیاز
                    </Badge>
                    {reward.stock !== null && (
                      <span className="text-xs text-muted-foreground">
                        {reward.stock} عدد باقی‌مانده
                      </span>
                    )}
                  </div>
                  <Button 
                    className="w-full"
                    disabled={loyaltyData.userPoints.points < reward.pointsCost}
                    onClick={() => handleRedeem(reward.id)}
                  >
                    دریافت پاداش
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* تاریخچه امتیازات */}
      <Card>
        <CardHeader>
          <CardTitle>تاریخچه امتیازات</CardTitle>
          <CardDescription>
            فعالیت‌های اخیر کسب و مصرف امتیاز
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loyaltyData?.transactions?.map((transaction: any) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <Badge 
                  variant={transaction.points > 0 ? "default" : "destructive"}
                  className="text-sm"
                >
                  {transaction.points > 0 ? '+' : ''}{transaction.points}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* لینک دعوت */}
      <Card>
        <CardHeader>
          <CardTitle>دعوت از دوستان</CardTitle>
          <CardDescription>
            به ازای هر دوستی که ثبت‌نام کند، ۵۰۰ امتیاز دریافت کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
              {loyaltyData?.referralLink}
            </div>
            <Button 
              variant="outline"
              onClick={() => navigator.clipboard.writeText(loyaltyData.referralLink)}
            >
              کپی لینک
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}