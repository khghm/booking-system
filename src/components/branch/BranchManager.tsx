/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
// src/components/branch/BranchManager.tsx - آپدیت شده
"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Edit, Trash2, Plus, MapPin, Phone, Mail, Users, Clock } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  staff: Staff[];
  workingHours: BranchWorkingHours[];
  createdAt: string;
}

interface Staff {
  id: string;
  name: string;
}

interface BranchWorkingHours {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const daysOfWeek = [
  "شنبه",
  "یکشنبه", 
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه"
];

export function BranchManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWorkingHours, setShowWorkingHours] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    latitude: "",
    longitude: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      } else {
        throw new Error('خطا در دریافت لیست شعب');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در دریافت لیست شعب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingBranch ? `/api/branches/${editingBranch.id}` : '/api/branches';
      const method = editingBranch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "موفق",
          description: editingBranch ? "شعبه با موفقیت ویرایش شد" : "شعبه جدید با موفقیت ایجاد شد",
        });
        
        setIsCreating(false);
        setEditingBranch(null);
        setFormData({
          name: "",
          address: "",
          phone: "",
          email: "",
          latitude: "",
          longitude: "",
        });
        
        loadBranches();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در ذخیره شعبه');
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در ذخیره اطلاعات شعبه",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone || "",
      email: branch.email || "",
      latitude: branch.latitude?.toString() || "",
      longitude: branch.longitude?.toString() || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این شعبه اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "موفق",
          description: "شعبه با موفقیت حذف شد",
        });
        loadBranches();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در حذف شعبه');
      }
    } catch (error: any) {
      toast({
        title: "خطا",
         
        description: error.message || "خطا در حذف شعبه",
        variant: "destructive",
      });
    }
  };

  const toggleBranchStatus = async (branch: Branch) => {
    try {
      const response = await fetch(`/api/branches/${branch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !branch.isActive }),
      });

      if (response.ok) {
        toast({
          title: "موفق",
          description: `شعبه ${!branch.isActive ? 'فعال' : 'غیرفعال'} شد`,
        });
        loadBranches();
      } else {
        throw new Error('خطا در تغییر وضعیت شعبه');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در تغییر وضعیت شعبه",
        variant: "destructive",
      });
    }
  };

  const getWorkingHoursText = (workingHours: BranchWorkingHours[]) => {
    const activeDays = workingHours
      .filter(wh => wh.isActive)
      .map(wh => daysOfWeek[wh.dayOfWeek])
      .join('، ');
    
    return activeDays || 'تعریف نشده';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">مدیریت شعب</h2>
          <Button disabled>
            <Plus className="ml-2 h-4 w-4" />
            شعبه جدید
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">در حال بارگذاری...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">مدیریت شعب</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="ml-2 h-4 w-4" />
          شعبه جدید
        </Button>
      </div>

      {/* فرم ایجاد/ویرایش شعبه */}
      {(isCreating || editingBranch) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBranch ? "ویرایش شعبه" : "شعبه جدید"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام شعبه *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="مثلاً: شعبه مرکزی"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">شماره تماس</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="021-12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="info@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">آدرس *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    placeholder="آدرس کامل شعبه"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitude">عرض جغرافیایی</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="35.6892"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">طول جغرافیایی</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="51.3890"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingBranch ? "ویرایش" : "ایجاد"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingBranch(null);
                    setFormData({
                      name: "",
                      address: "",
                      phone: "",
                      email: "",
                      latitude: "",
                      longitude: "",
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

      {/* لیست شعب */}
      <Card>
        <CardHeader>
          <CardTitle>لیست شعب</CardTitle>
          <CardDescription>
            مدیریت تمام شعب و نمایندگی‌ها ({branches.length} شعبه)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {branches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هیچ شعبه‌ای ثبت نشده است</p>
              <p className="text-sm mt-2">برای ایجاد اولین شعبه روی دکمه &quot;شعبه جدید&quot; کلیک کنید</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام شعبه</TableHead>
                  <TableHead>آدرس</TableHead>
                  <TableHead>تماس</TableHead>
                  <TableHead>پرسنل</TableHead>
                  <TableHead>ساعت کاری</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{branch.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs" title={branch.address}>
                        {branch.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {branch.phone && (
                          <div className="flex items-center space-x-1 space-x-reverse text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center space-x-1 space-x-reverse text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{branch.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 ml-1" />
                        {branch.staff.length} نفر
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowWorkingHours(branch)}
                      >
                        <Clock className="h-3 w-3 ml-1" />
                        مشاهده
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={branch.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleBranchStatus(branch)}
                      >
                        {branch.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(branch)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(branch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* دیالوگ نمایش ساعت کاری */}
      <Dialog open={!!showWorkingHours} onOpenChange={() => setShowWorkingHours(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ساعت کاری شعبه {showWorkingHours?.name}</DialogTitle>
            <DialogDescription>
              برنامه ساعت کاری این شعبه
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {showWorkingHours?.workingHours.map((wh) => (
              <div key={wh.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Badge variant={wh.isActive ? "default" : "secondary"}>
                    {wh.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                  <span className="font-medium">{daysOfWeek[wh.dayOfWeek]}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {wh.startTime} - {wh.endTime}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}