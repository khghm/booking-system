// src/app/register/page.tsx
import { RegisterForm } from "~/components/auth/RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ایجاد حساب کاربری</CardTitle>
          <CardDescription>
            اطلاعات خود را برای ایجاد حساب کاربری وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            قبلاً حساب دارید؟{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              وارد شوید
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}