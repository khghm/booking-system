/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/hooks/use-services.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Service } from "@prisma/client";
import { useToast } from "./use-toast";

export function useServices() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: async (): Promise<Service[]> => {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('خطا در دریافت سرویس‌ها');
      return response.json();
    },
  });

  const createService = useMutation({
    mutationFn: async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'خطا در ایجاد سرویس');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...serviceData }: Partial<Service> & { id: string }) => {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'خطا در بروزرسانی سرویس');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        throw new Error(error.error || 'خطا در حذف سرویس');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    services: services || [],
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
  };
}