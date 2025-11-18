/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// src/components/branch/BranchManager.tsx
"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Edit, Trash2, Plus, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

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
}

interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  isActive: boolean;
}

interface BranchWorkingHours {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export function BranchManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    latitude: "",
    longitude: "",
  });
  const { toast } = useToast();

  const daysOfWeek = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه"
  ];

  const loadBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در دریافت لیست شعب",
        variant: "destructive",
      });
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
        throw new Error('خطا در ذخیره شعبه');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ذخیره اطلاعات شعبه",
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
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در حذف شعبه",
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
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در تغییر وضعیت شعبه",
        variant: "destructive",
      });
    }
  };

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
                  <Label htmlFor="name">نام شعبه</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">شماره تماس</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">آدرس</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
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
            مدیریت تمام شعب و نمایندگی‌ها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام شعبه</TableHead>
                <TableHead>آدرس</TableHead>
                <TableHead>تماس</TableHead>
                <TableHead>پرسنل</TableHead>
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
                    <div className="max-w-xs truncate" title={branch.address}>
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
                      {branch.staff.length} نفر
                    </Badge>
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
        </CardContent>
      </Card>
    </div>
  );
}