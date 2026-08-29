/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/components/admin/AdminLayout.tsx - طراحی جدید
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { AdminHeader } from "./AdminHeader";

const adminMenuItems = [
  {
    title: "داشبورد",
    href: "/admin",
    icon: DashboardIcon,
    description: "نمای کلی سیستم",
    color: "from-blue-500 to-blue-600",
    badge: null
  },
  {
    title: "مدیریت نوبت‌ها",
    href: "/admin/appointments",
    icon: CalendarIcon,
    description: "مدیریت و تأیید نوبت‌ها",
    color: "from-green-500 to-green-600",
    badge: "۱۲"
  },
  {
    title: "مدیریت شعب",
    href: "/admin/branches",
    icon: BuildingIcon,
    description: "مدیریت شعب و نمایندگی‌ها",
    color: "from-purple-500 to-purple-600",
    badge: null
  },
  {
    title: "مدیریت پرسنل",
    href: "/admin/staff",
    icon: UsersIcon,
    description: "مدیریت کارکنان و پرسنل",
    color: "from-orange-500 to-orange-600",
    badge: null
  },
  {
    title: "گزارش‌گیری",
    href: "/admin/reports",
    icon: BarChartIcon,
    description: "گزارش‌های تحلیلی و آماری",
    color: "from-cyan-500 to-cyan-600",
    badge: "جدید"
  },
  {
    title: "مدیریت بکاپ",
    href: "/admin/backup",
    icon: DatabaseIcon,
    description: "پشتیبان‌گیری و بازیابی",
    color: "from-red-500 to-red-600",
    badge: null
  },
  {
    title: "API مستندات",
    href: "/api-docs",
    icon: CodeIcon,
    description: "مستندات API سیستم",
    color: "from-indigo-500 to-indigo-600",
    badge: null
  },
  {
    title: "اعلان‌ها",
    href: "/admin/notifications",
    icon: BellIcon,
    description: "مدیریت اعلان‌ها",
    color: "from-pink-500 to-pink-600",
    badge: "۳"
  },
  {
    title: "تنظیمات",
    href: "/admin/settings",
    icon: SettingsIcon,
    description: "تنظیمات سیستم",
    color: "from-gray-500 to-gray-600",
    badge: null
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen bg-linear-to-br from-slate-50 to-blue-50/30">
        <div className="flex-1 overflow-hidden">
          <div className="h-20 bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 animate-pulse"></div>
          <div className="p-8">
            <div className="h-8 bg-gray-200 rounded-xl w-1/4 mb-8 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Sidebar for desktop - طراحی جدید */}
      <div className="hidden lg:flex lg:shrink-0">
        <div className="w-80 bg-white/80 backdrop-blur-xl border-l border-white/20 shadow-xl">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <ShieldIcon className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-linear-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  پنل مدیریت
                </h1>
                <p className="text-sm text-gray-500 mt-1">سامانه نوبت‌دهی هوشمند</p>
              </div>
            </div>
          </div>
          
          {/* Sidebar Content */}
          <div className="p-6">
            <nav className="space-y-2">
              {adminMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center space-x-4 space-x-reverse p-4 rounded-2xl transition-all duration-300 transform hover:scale-105",
                      isActive
                        ? "bg-white shadow-lg shadow-blue-500/10 border border-blue-100"
                        : "hover:bg-white/50 hover:shadow-md"
                    )}
                  >
                    {/* Background gradient for active state */}
                    {isActive && (
                      <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-transparent rounded-2xl"></div>
                    )}
                    
                    {/* Icon */}
                    <div className={cn(
                      "relative z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg",
                      isActive 
                        ? item.color + " shadow-blue-500/25"
                        : "bg-gray-100 group-hover:shadow-md"
                    )}>
                      <item.icon className={cn(
                        "h-6 w-6 transition-all duration-300",
                        isActive ? "text-white" : "text-gray-600 group-hover:text-gray-800"
                      )} />
                    </div>
                    
                    {/* Text content */}
                    <div className="relative z-10 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "font-semibold transition-colors duration-300",
                          isActive ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                        )}>
                          {item.title}
                        </div>
                        {item.badge && (
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300",
                            isActive 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        "text-sm transition-colors duration-300 mt-1",
                        isActive ? "text-gray-600" : "text-gray-500 group-hover:text-gray-600"
                      )}>
                        {item.description}
                      </div>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* System Status Card */}
            <div className="mt-8 p-6 bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl text-white shadow-xl">
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <ActivityIcon className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold">وضعیت سیستم</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">سرور</span>
                  <StatusBadge status="online">فعال</StatusBadge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">دیتابیس</span>
                  <StatusBadge status="online">متصل</StatusBadge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">API</span>
                  <StatusBadge status="online">آنلاین</StatusBadge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">فضای ذخیره‌سازی</span>
                  <span className="text-green-400 text-sm font-medium">۷۸٪</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-linear-to-r from-green-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: '78%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 flex w-80">
            <div className="w-full bg-white/95 backdrop-blur-xl shadow-2xl">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <ShieldIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">پنل مدیریت</h1>
                      <p className="text-sm text-gray-500">سامانه نوبت‌دهی</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <nav className="space-y-2">
                  {adminMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-4 space-x-reverse p-4 rounded-2xl transition-all duration-200",
                        pathname === item.href
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        pathname === item.href ? item.color + " text-white" : "bg-gray-100"
                      )}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content with new styling */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// کامپوننت StatusBadge
function StatusBadge({ status, children }: { status: "online" | "offline" | "warning"; children: React.ReactNode }) {
  const statusConfig = {
    online: "bg-green-100 text-green-700 border-green-200",
    offline: "bg-red-100 text-red-700 border-red-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[status]}`}>
      {children}
    </span>
  );
}

// آیکون‌های سفارشی
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10" /></svg>;
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}

function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
}

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
}

function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>;
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.77-4.11 1 1 0 00-1.94-.5 7.97 7.97 0 005.04 5.48 1 1 0 00.67-1.87z" /></svg>;
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}