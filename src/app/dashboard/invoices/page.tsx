/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// src/app/dashboard/invoices/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "~/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Download, FileText, Calendar, CreditCard } from "lucide-react";
import { db } from "~/lib/db";
import { formatDate, formatCurrency } from "~/lib/utils";

async function getUserInvoices(userId: string) {
  try {
    // در اینجا می‌توانید invoices واقعی از دیتابیس بگیرید
    // فعلاً از appointmentها به عنوان invoice استفاده می‌کنیم
    const appointments = await db.appointment.findMany({
      where: { 
        userId: userId,
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      include: {
        service: {
          select: {
            name: true,
            price: true
          }
        },
        branch: {
          select: {
            name: true
          }
        }
      },
      orderBy: { 
        date: 'desc' 
      }
    });

    // تبدیل appointments به invoices
    const invoices = appointments.map((appointment, index) => ({
      id: `INV-${appointment.id.slice(-8).toUpperCase()}`,
      appointmentId: appointment.id,
      amount: appointment.service.price || 0,
      status: appointment.status === 'COMPLETED' ? 'PAID' as const : 'PENDING' as const,
      date: appointment.date,
      dueDate: new Date(appointment.date),
      service: appointment.service.name,
      branch: appointment.branch.name,
    }));

    return invoices;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const invoices = await getUserInvoices(session.user.id);

  const getStatusBadge = (status: string) => {
    const variants = {
      PAID: "default",
      PENDING: "secondary",
      OVERDUE: "destructive"
    } as const;

    const labels = {
      PAID: "پرداخت شده",
      PENDING: "در انتظار پرداخت",
      OVERDUE: "معوقه"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">صورتحساب‌ها</h1>
            <p className="text-muted-foreground">
              مدیریت و مشاهده تمام صورتحساب‌های شما
            </p>
          </div>
        </div>

        {/* آمار کلی */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">کل صورتحساب‌ها</p>
                  <p className="text-2xl font-bold">{invoices.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">پرداخت شده</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">در انتظار پرداخت</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>لیست صورتحساب‌ها</CardTitle>
            <CardDescription>
              تمام صورتحساب‌های شما - {invoices.length} صورتحساب
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز صورتحسابی ندارید</h3>
                <p className="text-muted-foreground">
                  پس از رزرو و تکمیل نوبت، صورتحساب‌های شما اینجا نمایش داده می‌شوند
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4 space-x-reverse flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-600' :
                        invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-1">
                          <h3 className="font-semibold">{invoice.id}</h3>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 ml-1" />
                            <span>تاریخ: {formatDate(invoice.date)}</span>
                          </div>
                          <div>
                            <span>سرویس: {invoice.service}</span>
                          </div>
                          <div>
                            <span>شعبه: {invoice.branch}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="text-right">
                        <div className="font-semibold text-lg">{formatCurrency(invoice.amount)}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.status === 'PAID' ? 'پرداخت شده' : 'در انتظار پرداخت'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 ml-1" />
                          دانلود
                        </Button>
                        {invoice.status === 'PENDING' && (
                          <Button size="sm">
                            پرداخت
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* راهنما */}
        <Card>
          <CardHeader>
            <CardTitle>راهنمای وضعیت صورتحساب‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge variant="secondary">در انتظار پرداخت</Badge>
                <span className="text-muted-foreground">صورتحساب منتظر پرداخت</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge variant="default">پرداخت شده</Badge>
                <span className="text-muted-foreground">صورتحساب پرداخت شده</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge variant="destructive">معوقه</Badge>
                <span className="text-muted-foreground">صورتحساب گذشته از موعد</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}