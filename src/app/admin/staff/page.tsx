// src/app/admin/staff/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { StaffManager } from "~/components/staff/StaffManager";

export default async function StaffPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout>
      <StaffManager />
    </AdminLayout>
  );
}