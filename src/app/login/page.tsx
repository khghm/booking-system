// src/app/login/page.tsx
import { LoginForm } from "~/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ورود به حساب کاربری</CardTitle>
          <CardDescription>
            برای دسترسی به پنل کاربری خود وارد شوید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            حساب کاربری ندارید؟{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              ثبت‌نام کنید
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}