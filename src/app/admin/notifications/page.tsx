// src/app/admin/notifications/page.tsx - آپدیت شده
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { NotificationsManager } from "~/components/admin/NotificationsManager";

export default async function AdminNotificationsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout>
      <NotificationsManager />
    </AdminLayout>
  );
}