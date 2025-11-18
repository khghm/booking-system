// src/app/admin/branches/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { BranchManager } from "~/components/branch/BranchManager";

export default async function BranchesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout>
      <BranchManager />
    </AdminLayout>
  );
}