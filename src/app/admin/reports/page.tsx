// src/app/admin/reports/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { AdvancedReports } from "~/components/reports/AdvancedReports";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout>
      <AdvancedReports />
    </AdminLayout>
  );
}