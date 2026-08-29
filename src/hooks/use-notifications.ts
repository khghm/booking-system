/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/hooks/use-notifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export function useNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications?unreadOnly=true&limit=10');
      if (!response.ok) throw new Error('خطا در دریافت اعلان‌ها');
      return response.json();
    },
    refetchInterval: 30000, // هر ۳۰ ثانیه آپدیت شود
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(notificationIds ? { notificationIds } : { markAllAsRead: true })
        }),
      });
      if (!response.ok) throw new Error('خطا در بروزرسانی اعلان');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (data: {
      type: string;
      title: string;
      message: string;
      userId?: string;
      priority?: string;
    }) => {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('خطا در ایجاد اعلان');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "موفق",
        description: "اعلان جدید ایجاد شد",
      });
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAsReadPending: markAsReadMutation.isPending,
    createNotification: createNotificationMutation.mutate,
    createNotificationPending: createNotificationMutation.isPending,
  };
}