/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
// src/components/staff/StaffManager.tsx - اصلاح شده
"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Edit, Trash2, Plus, User, Mail, Phone, MapPin, Save, X } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  bio?: string;
  image?: string;
  isActive: boolean;
  branch: {
    id: string;
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

export function StaffManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    bio: "",
    branchId: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStaff();
    loadBranches();
  }, []);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      } else {
        throw new Error('خطا در دریافت داده‌ها');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در دریافت لیست پرسنل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    setIsLoading(true);
    
    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "موفق",
          description: editingStaff ? "پرسنل با موفقیت ویرایش شد" : "پرسنل جدید با موفقیت ایجاد شد",
        });
        
        resetForm();
        loadStaff();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در ذخیره اطلاعات پرسنل');
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در ذخیره اطلاعات پرسنل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone || "",
      specialty: staffMember.specialty || "",
      bio: staffMember.bio || "",
      branchId: staffMember.branch.id,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این پرسنل اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "موفق",
          description: "پرسنل با موفقیت حذف شد",
        });
        loadStaff();
      } else {
        throw new Error('خطا در حذف پرسنل');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در حذف پرسنل",
        variant: "destructive",
      });
    }
  };

  const toggleStaffStatus = async (staffMember: Staff) => {
    try {
      const response = await fetch(`/api/staff/${staffMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !staffMember.isActive }),
      });

      if (response.ok) {
        toast({
          title: "موفق",
          description: `پرسنل ${!staffMember.isActive ? 'فعال' : 'غیرفعال'} شد`,
        });
        loadStaff();
      } else {
        throw new Error('خطا در تغییر وضعیت پرسنل');
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در تغییر وضعیت پرسنل",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialty: "",
      bio: "",
      branchId: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">مدیریت پرسنل</h2>
        <Button onClick={() => setIsCreating(true)} disabled={isLoading}>
          <Plus className="ml-2 h-4 w-4" />
          پرسنل جدید
        </Button>
      </div>

      {/* فرم ایجاد/ویرایش پرسنل */}
      {(isCreating || editingStaff) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {editingStaff ? "ویرایش پرسنل" : "پرسنل جدید"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام و نام خانوادگی *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">شماره تماس</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">تخصص</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    placeholder="مثلاً: پوست و مو، دندانپزشک، مشاور"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchId">شعبه *</Label>
                  <Select
                    value={formData.branchId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب شعبه" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">شرح حال و تخصص‌ها</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  placeholder="توضیحات درباره تخصص‌ها، سوابق و مهارت‌ها..."
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  <Save className="ml-2 h-4 w-4" />
                  {isLoading ? "در حال ذخیره..." : (editingStaff ? "ویرایش" : "ایجاد")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* لیست پرسنل */}
      <Card>
        <CardHeader>
          <CardTitle>لیست پرسنل</CardTitle>
          <CardDescription>
            مدیریت تمام پرسنل و کارکنان شعب
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">در حال بارگذاری...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هیچ پرسنلی یافت نشد</p>
              <p className="text-sm mt-2">برای افزودن پرسنل جدید روی دکمه &quot;پرسنل جدید&ldquo; کلیک کنید</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>پرسنل</TableHead>
                  <TableHead>تماس</TableHead>
                  <TableHead>تخصص</TableHead>
                  <TableHead>شعبه</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((staffMember) => (
                  <TableRow key={staffMember.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="flex-shrink-0">
                          {staffMember.image ? (
                            <img
                              src={staffMember.image}
                              alt={staffMember.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{staffMember.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 ml-1" />
                            {staffMember.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {staffMember.phone && (
                        <div className="flex items-center space-x-1 space-x-reverse text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{staffMember.phone}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {staffMember.specialty && (
                        <Badge variant="outline" className="text-xs">
                          {staffMember.specialty}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 space-x-reverse text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{staffMember.branch.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={staffMember.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleStaffStatus(staffMember)}
                      >
                        {staffMember.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(staffMember)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(staffMember.id)}
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
    </div>
  );
}