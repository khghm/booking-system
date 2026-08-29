/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/components/admin/NotificationsManager.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Eye, EyeOff, Trash2, Plus, Bell, Search, Filter, Send } from "lucide-react";
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

interface NotificationStats {
  today: number;
  byType: Array<{
    type: string;
    _count: { id: number };
  }>;
}

export function NotificationsManager() {
  const [filters, setFilters] = useState({
    type: "ALL",
    isRead: "ALL",
    priority: "ALL",
    search: "",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: "SYSTEM_ALERT",
    title: "",
    message: "",
    userId: "",
    priority: "MEDIUM",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['admin-notifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type !== 'ALL') params.append('type', filters.type);
      if (filters.isRead !== 'ALL') params.append('isRead', filters.isRead);
      if (filters.priority !== 'ALL') params.append('priority', filters.priority);
      
      const response = await fetch(`/api/admin/notifications?${params}`);
      if (!response.ok) throw new Error('خطا در دریافت اعلان‌ها');
      return response.json();
    },
  });

  const updateNotificationMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('خطا در بروزرسانی اعلان');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "موفق",
        description: "اعلان با موفقیت بروزرسانی شد",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('خطا در حذف اعلان');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "موفق",
        description: "اعلان با موفقیت حذف شد",
      });
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('خطا در ایجاد اعلان');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setIsCreateDialogOpen(false);
      setNewNotification({
        type: "SYSTEM_ALERT",
        title: "",
        message: "",
        userId: "",
        priority: "MEDIUM",
      });
      toast({
        title: "موفق",
        description: "اعلان جدید با موفقیت ایجاد شد",
      });
    },
  });

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    createNotificationMutation.mutate(newNotification);
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'APPOINTMENT_REMINDER': 'یادآوری نوبت',
      'APPOINTMENT_CONFIRMED': 'تأیید نوبت',
      'APPOINTMENT_CANCELLED': 'لغو نوبت',
      'NEW_APPOINTMENT': 'نوبت جدید',
      'SYSTEM_ALERT': 'هشدار سیستم',
      'SECURITY_ALERT': 'هشدار امنیتی',
      'PAYMENT_SUCCESS': 'پرداخت موفق',
      'PAYMENT_FAILED': 'خطای پرداخت',
    };
    return typeMap[type] ?? type;
  };

  const getPriorityVariant = (priority: string) => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'LOW': 'secondary',
      'MEDIUM': 'default',
      'HIGH': 'outline',
      'URGENT': 'destructive',
    };
    return variantMap[priority] ?? 'default';
  };

  const getPriorityText = (priority: string) => {
    const textMap: Record<string, string> = {
      'LOW': 'کم',
      'MEDIUM': 'متوسط',
      'HIGH': 'بالا',
      'URGENT': 'فوری',
    };
    return textMap[priority] ?? priority;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">مدیریت اعلان‌ها</h2>
          <Button disabled>
            <Plus className="ml-2 h-4 w-4" />
            اعلان جدید
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 space-x-reverse">
                  <div className="h-12 bg-gray-200 rounded w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { notifications, unreadCount, stats } = notificationsData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">مدیریت اعلان‌ها</h2>
          <p className="text-muted-foreground mt-1">
            مدیریت و پیگیری اعلان‌های سیستم
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              اعلان جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>ایجاد اعلان جدید</DialogTitle>
              <DialogDescription>
                ارسال اعلان جدید به کاربران سیستم
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">نوع اعلان</Label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYSTEM_ALERT">هشدار سیستم</SelectItem>
                      <SelectItem value="SECURITY_ALERT">هشدار امنیتی</SelectItem>
                      <SelectItem value="APPOINTMENT_REMINDER">یادآوری نوبت</SelectItem>
                      <SelectItem value="APPOINTMENT_CONFIRMED">تأیید نوبت</SelectItem>
                      <SelectItem value="APPOINTMENT_CANCELLED">لغو نوبت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">اولویت</Label>
                  <Select
                    value={newNotification.priority}
                    onValueChange={(value) => setNewNotification(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">کم</SelectItem>
                      <SelectItem value="MEDIUM">متوسط</SelectItem>
                      <SelectItem value="HIGH">بالا</SelectItem>
                      <SelectItem value="URGENT">فوری</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">عنوان اعلان</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="عنوان اعلان را وارد کنید..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">پیام اعلان</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="متن کامل اعلان را وارد کنید..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">کاربر مقصد (اختیاری)</Label>
                <Input
                  id="userId"
                  value={newNotification.userId}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="ID کاربر - در صورت خالی بودن برای همه ارسال می‌شود"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createNotificationMutation.isPending}
                  className="flex-1"
                >
                  <Send className="ml-2 h-4 w-4" />
                  {createNotificationMutation.isPending ? "در حال ارسال..." : "ارسال اعلان"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* آمار و فیلترها */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل اعلان‌ها</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationsData?.pagination?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.today ?? 0} مورد در ۲۴ ساعت گذشته
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">خوانده نشده</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              نیاز به توجه
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فوری</CardTitle>
            <Bell className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications?.filter((n: Notification) => n.priority === 'URGENT').length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              اولویت بالا
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فعال</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications?.filter((n: Notification) => n.isActive).length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              اعلان‌های فعال
            </p>
          </CardContent>
        </Card>
      </div>

      {/* فیلترها */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="ml-2 h-5 w-5" />
            فیلترها
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>نوع اعلان</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">همه انواع</SelectItem>
                  <SelectItem value="SYSTEM_ALERT">هشدار سیستم</SelectItem>
                  <SelectItem value="SECURITY_ALERT">هشدار امنیتی</SelectItem>
                  <SelectItem value="APPOINTMENT_REMINDER">یادآوری نوبت</SelectItem>
                  <SelectItem value="APPOINTMENT_CONFIRMED">تأیید نوبت</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>وضعیت خواندن</Label>
              <Select
                value={filters.isRead}
                onValueChange={(value) => setFilters(prev => ({ ...prev, isRead: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">همه</SelectItem>
                  <SelectItem value="true">خوانده شده</SelectItem>
                  <SelectItem value="false">خوانده نشده</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>اولویت</Label>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">همه</SelectItem>
                  <SelectItem value="URGENT">فوری</SelectItem>
                  <SelectItem value="HIGH">بالا</SelectItem>
                  <SelectItem value="MEDIUM">متوسط</SelectItem>
                  <SelectItem value="LOW">کم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>جستجو</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="جستجو در عنوان و پیام..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* لیست اعلان‌ها */}
      <Card>
        <CardHeader>
          <CardTitle>لیست اعلان‌ها</CardTitle>
          <CardDescription>
            مدیریت و پیگیری تمام اعلان‌های سیستم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نوع</TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>اولویت</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications
                ?.filter((notification: Notification) => {
                  if (!filters.search) return true;
                  const searchTerm = filters.search.toLowerCase();
                  return (
                    notification.title.toLowerCase().includes(searchTerm) ||
                    notification.message.toLowerCase().includes(searchTerm)
                  );
                })
                ?.map((notification: Notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {getTypeText(notification.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {notification.message}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {notification.user ? (
                      <div>
                        <div className="font-medium">{notification.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {notification.user.email}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="secondary">همه کاربران</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(notification.priority)}>
                      {getPriorityText(notification.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{formatDate(notification.createdAt)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <Badge 
                        variant={notification.isRead ? "secondary" : "default"}
                        className="text-xs w-fit"
                      >
                        {notification.isRead ? 'خوانده شده' : 'خوانده نشده'}
                      </Badge>
                      <Badge 
                        variant={notification.isActive ? "default" : "outline"}
                        className="text-xs w-fit"
                      >
                        {notification.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateNotificationMutation.mutate({
                          id: notification.id,
                          isRead: !notification.isRead
                        })}
                        disabled={updateNotificationMutation.isPending}
                      >
                        {notification.isRead ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('آیا از حذف این اعلان اطمینان دارید؟')) {
                            deleteNotificationMutation.mutate(notification.id);
                          }
                        }}
                        disabled={deleteNotificationMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {notifications?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هیچ اعلانی یافت نشد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}