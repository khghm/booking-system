/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/components/admin/AdminHeader.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  Search,
  Home,
  Shield,
  LayoutDashboard,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "~/hooks/use-toast";
import { formatDate, formatTime } from "~/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  isActive: boolean;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // دریافت اعلان‌های خوانده نشده
  const { data: notificationsData } = useQuery({
    queryKey: ['admin-notifications', 'unread'],
    queryFn: async () => {
      const response = await fetch('/api/admin/notifications?isRead=false&limit=10');
      if (!response.ok) throw new Error('خطا در دریافت اعلان‌ها');
      return response.json();
    },
    refetchInterval: 30000, // هر ۳۰ ثانیه آپدیت شود
  });

  const unreadNotifications = notificationsData?.notifications ?? [];
  const unreadCount = notificationsData?.unreadCount ?? 0;

  // mutation برای علامت‌گذاری اعلان به عنوان خوانده شده
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      if (!response.ok) throw new Error('خطا در بروزرسانی اعلان');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // mutation برای حذف اعلان
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('خطا در حذف اعلان');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "موفق",
        description: "اعلان حذف شد",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // هدایت به صفحه جستجو
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const handleMarkAllAsRead = async () => {
    try {
      const promises = unreadNotifications.map((notification: Notification) =>
        markAsReadMutation.mutateAsync(notification.id)
      );
      await Promise.all(promises);
      toast({
        title: "موفق",
        description: "همه اعلان‌ها خوانده شدند",
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بروزرسانی اعلان‌ها",
        variant: "destructive",
      });
    }
  };

  const getPageTitle = () => {
    const pathMap: Record<string, string> = {
      '/admin': 'داشبورد مدیریت',
      '/admin/branches': 'مدیریت شعب',
      '/admin/staff': 'مدیریت پرسنل',
      '/admin/appointments': 'مدیریت نوبت‌ها',
      '/admin/reports': 'گزارش‌گیری',
      '/admin/backup': 'مدیریت بکاپ',
      '/admin/notifications': 'اعلان‌ها',
      '/admin/settings': 'تنظیمات',
    };
    
    return pathMap[pathname] ?? 'پنل مدیریت';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'APPOINTMENT_CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'APPOINTMENT_CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'SECURITY_ALERT':
        return <Shield className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        {/* سمت راست - منو و عنوان */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-500">
                سامانه مدیریت نوبت‌دهی
              </p>
            </div>
          </div>
        </div>

        {/* وسط - جستجو */}
        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="جستجو در نوبت‌ها، کاربران، سرویس‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>

        {/* سمت چپ - ناوبری و پروفایل */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* سوییچ بین داشبوردها */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <LayoutDashboard className="ml-2 h-4 w-4" />
                تغییر دیدگاه
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>انتخاب دیدگاه</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer flex items-center">
                  <Shield className="ml-2 h-4 w-4 text-blue-600" />
                  پنل مدیریت
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer flex items-center">
                  <LayoutDashboard className="ml-2 h-4 w-4 text-green-600" />
                  داشبورد کاربری
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer flex items-center">
                  <Home className="ml-2 h-4 w-4 text-gray-600" />
                  صفحه اصلی سایت
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* دکمه بازگشت به سایت (برای موبایل) */}
          <Link href="/" className="sm:hidden">
            <Button variant="ghost" size="icon">
              <Home className="h-4 w-4" />
            </Button>
          </Link>

          {/* نوتیفیکیشن */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    variant="destructive"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-hidden">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>اعلان‌ها</span>
                <div className="flex items-center space-x-2 space-x-reverse">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="h-6 text-xs"
                    >
                      علامت‌گذاری همه
                    </Button>
                  )}
                  <Badge variant="secondary">
                    {unreadCount} جدید
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* لیست نوتیفیکیشن‌ها */}
              <div className="max-h-64 overflow-y-auto">
                {unreadNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">هیچ اعلان جدیدی وجود ندارد</p>
                  </div>
                ) : (
                  unreadNotifications.map((notification: Notification) => (
                    <DropdownMenuItem 
                      key={notification.id}
                      className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="flex items-start space-x-3 space-x-reverse w-full">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium line-clamp-1">
                              {notification.title}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getNotificationPriorityColor(notification.priority)}`}
                            >
                              {notification.priority === 'URGENT' ? 'فوری' : 
                               notification.priority === 'HIGH' ? 'بالا' : 'عادی'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {formatDate(notification.createdAt)} - {formatTime(notification.createdAt)}
                            </span>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                disabled={markAsReadMutation.isPending}
                              >
                                <Eye className="h-3 w-3 ml-1" />
                                خواندم
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-red-600 hover:text-red-700"
                                onClick={() => {
                                  if (confirm('آیا از حذف این اعلان اطمینان دارید؟')) {
                                    deleteNotificationMutation.mutate(notification.id);
                                  }
                                }}
                                disabled={deleteNotificationMutation.isPending}
                              >
                                حذف
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="justify-center cursor-pointer">
                <Link href="/admin/notifications" className="text-blue-600">
                  مشاهده همه اعلان‌ها
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* پروفایل کاربر */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium">{session?.user?.name ?? 'مدیر سیستم'}</div>
                  <div className="text-xs text-gray-500">سطح دسترسی: ادمین</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name ?? 'مدیر سیستم'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <Badge variant="default" className="w-fit mt-1">
                    مدیر سیستم
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer flex items-center">
                  <Settings className="ml-2 h-4 w-4" />
                  تنظیمات پنل
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex items-center">
                  <User className="ml-2 h-4 w-4" />
                  پروفایل کاربری
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer flex items-center">
                  <LayoutDashboard className="ml-2 h-4 w-4" />
                  داشبورد کاربری
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 flex items-center"
                onClick={handleSignOut}
              >
                <LogOut className="ml-2 h-4 w-4" />
                خروج از سیستم
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* نوار وضعیت سریع */}
      <div className="bg-blue-50 border-t border-blue-100">
        <div className="px-6 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-gray-600">وضعیت سیستم:</span>
                <Badge variant="default" className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-1"></div>
                  آنلاین
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-gray-600">آخرین بروزرسانی:</span>
                <span className="font-medium">
                  {new Date().toLocaleTimeString('fa-IR')}
                </span>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-gray-600">اعلان‌های جدید:</span>
                <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
                  {unreadCount} مورد
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 space-x-reverse">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="ml-2 h-4 w-4" />
                  رفتن به داشبورد کاربری
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
              >
                <Link href="/">
                  <Home className="ml-2 h-4 w-4" />
                  بازگشت به صفحه اصلی
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}