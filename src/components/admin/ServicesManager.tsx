/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/components/admin/ServicesManager.tsx
"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { useServices } from "~/hooks/use-services";
import { useToast } from "~/hooks/use-toast";

export function ServicesManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    color: "#3b82f6"
  });

  const { services, isLoading, createService, updateService, deleteService } = useServices();
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createService.mutateAsync({
        name: formData.name,
        description: formData.description,
        duration: parseInt(formData.duration),
        price: formData.price ? parseFloat(formData.price) : null,
        color: formData.color,
        isActive: true,
      });

      toast({
        title: "موفق",
        description: "سرویس با موفقیت ایجاد شد",
      });

      setIsCreating(false);
      setFormData({
        name: "",
        description: "",
        duration: "",
        price: "",
        color: "#3b82f6"
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ایجاد سرویس",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateService.mutateAsync({
        id: editingService.id,
        ...formData,
        duration: parseInt(formData.duration),
        price: formData.price ? parseFloat(formData.price) : null,
      });

      toast({
        title: "موفق",
        description: "سرویس با موفقیت ویرایش شد",
      });

      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        duration: "",
        price: "",
        color: "#3b82f6"
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ویرایش سرویس",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این سرویس اطمینان دارید؟")) return;

    try {
      await deleteService.mutateAsync(id);
      toast({
        title: "موفق",
        description: "سرویس با موفقیت حذف شد",
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در حذف سرویس",
        variant: "destructive",
      });
    }
  };

  const startEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      duration: service.duration.toString(),
      price: service.price?.toString() || "",
      color: service.color || "#3b82f6"
    });
  };

  if (isLoading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">مدیریت سرویس‌ها</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="ml-2 h-4 w-4" />
          سرویس جدید
        </Button>
      </div>

      {/* فرم ایجاد/ویرایش */}
      {(isCreating || editingService) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingService ? "ویرایش سرویس" : "سرویس جدید"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingService ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام سرویس</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">مدت زمان (دقیقه)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">قیمت (تومان)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">رنگ</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingService ? "ویرایش" : "ایجاد"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingService(null);
                    setFormData({
                      name: "",
                      description: "",
                      duration: "",
                      price: "",
                      color: "#3b82f6"
                    });
                  }}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* جدول سرویس‌ها */}
      <Card>
        <CardHeader>
          <CardTitle>لیست سرویس‌ها</CardTitle>
          <CardDescription>
            مدیریت تمام سرویس‌های قابل ارائه
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>مدت زمان</TableHead>
                <TableHead>قیمت</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: service.color || "#3b82f6" }}
                      />
                      <span>{service.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{service.duration} دقیقه</TableCell>
                  <TableCell>
                    {service.price ? (
                      <span>{service.price.toLocaleString()} تومان</span>
                    ) : (
                      <span className="text-gray-500">رایگان</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}