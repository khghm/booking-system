// src/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { TremorDashboard } from "~/components/analytics/TremorDashboard";
import { RealTimeAlerts } from "~/components/notifications/RealTimeAlerts";
import { AppointmentsManager } from "~/components/admin/AppointmentsManager";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              داشبورد مدیریت
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              نمای کلی و آمار سیستم
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-white/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20 shadow-sm">
            آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
          </div>
        </div>

        <TremorDashboard />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <AppointmentsManager />
          </div>
          <div className="xl:col-span-1">
            <RealTimeAlerts />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
