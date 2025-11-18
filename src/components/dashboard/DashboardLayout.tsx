// src/components/dashboard/DashboardLayout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  Calendar,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  CreditCard
} from "lucide-react";

const dashboardMenuItems = [
  {
    title: "داشبورد",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "نوبت‌های من",
    href: "/dashboard/appointments",
    icon: Calendar,
  },
  {
    title: "پروفایل",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "صورتحساب‌ها",
    href: "/dashboard/invoices",
    icon: CreditCard,
  },
  {
    title: "تنظیمات",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar className="w-64 border-l">
          <SidebarHeader>
            <div className="flex items-center space-x-2 space-x-reverse p-4">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">پنل کاربری</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {dashboardMenuItems.map((item) => (
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
              
              {/* بخش مدیریت برای ادمین */}
              {session?.user.role === 'ADMIN' && (
                <SidebarMenuItem>
                  <Link
                    href="/admin"
                    className="flex items-center space-x-3 space-x-reverse px-3 py-2 text-sm font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>پنل مدیریت</span>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>

            {/* دکمه خروج */}
            <div className="p-4 border-t mt-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => signOut()}
              >
                <LogOut className="ml-2 h-4 w-4" />
                خروج
              </Button>
            </div>
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
                    <span className="text-lg font-semibold">پنل کاربری</span>
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
                  {dashboardMenuItems.map((item) => (
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
                پنل کاربری
              </h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{session?.user.name}</div>
                  <div className="text-gray-500">{session?.user.role === 'ADMIN' ? 'مدیر' : 'کاربر'}</div>
                </div>
              </div>
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