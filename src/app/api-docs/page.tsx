// src/app/api-docs/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { ApiDocumentation } from "~/components/api/ApiDocumentation";
import { Header } from "~/components/shared/Header";

export default async function ApiDocsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ApiDocumentation />
      </div>
    </div>
  );
}