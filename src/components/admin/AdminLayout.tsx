// src/components/admin/AdminLayout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem 
} from "~/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Building, 
  BarChart3, 
  Database, 
  Code,
  Menu,
  X
} from "lucide-react";

const adminMenuItems = [
  {
    title: "داشبورد",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "مدیریت شعب",
    href: "/admin/branches",
    icon: Building,
  },
  {
    title: "مدیریت پرسنل",
    href: "/admin/staff",
    icon: Users,
  },
  {
    title: "گزارش‌گیری",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "مدیریت بکاپ",
    href: "/admin/backup",
    icon: Database,
  },
  {
    title: "API Documentation",
    href: "/api-docs",
    icon: Code,
  },
  {
    title: "تنظیمات",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar className="w-64 border-l">
          <SidebarHeader>
            <div className="flex items-center space-x-2 space-x-reverse p-4">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">پنل مدیریت</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 space-x-reverse px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      pathname === item.href
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64">
            <Sidebar className="w-full">
              <SidebarHeader>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <LayoutDashboard className="h-6 w-6 text-blue-600" />
                    <span className="text-lg font-semibold">پنل مدیریت</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 space-x-reverse px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                          pathname === item.href
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 mr-4">
                پنل مدیریت
              </h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('fa-IR')}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}