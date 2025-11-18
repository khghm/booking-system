/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // اعتبارسنجی
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "خطا",
          description: "رمز عبور و تکرار آن مطابقت ندارند",
          variant: "destructive",
        });
        setIsLoading(false); // ⬅️ فراموش نکنید که لودینگ را متوقف کنید
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "خطا",
          description: "رمز عبور باید حداقل ۶ کاراکتر باشد",
          variant: "destructive",
        });
        setIsLoading(false); // ⬅️ فراموش نکنید که لودینگ را متوقف کنید
        return;
      }


      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password, // ⬅️ ارسال رمز عبور ساده
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        throw new Error(data.error ?? "خطا در ثبت‌نام");
      }

      toast({
        title: "ثبت‌نام موفق",
        description: "حساب کاربری شما با موفقیت ایجاد شد",
      });

      router.push("/login");
    } catch (error: any) {
      toast({
        title: "خطا",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>ثبت‌نام در سیستم</CardTitle>
        <CardDescription>
          اطلاعات خود را برای ایجاد حساب کاربری وارد کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">نام و نام خانوادگی</Label>
            <Input
              id="name"
              name="name"
              placeholder="نام خود را وارد کنید"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">شماره تماس</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="09123456789"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}