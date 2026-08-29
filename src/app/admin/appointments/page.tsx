// src/app/admin/appointments/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { AppointmentsManager } from "~/components/admin/AppointmentsManager";

export default async function AdminAppointmentsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout>
      <AppointmentsManager />
    </AdminLayout>
  );
}