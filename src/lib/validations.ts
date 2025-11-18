// src/lib/validations.ts
import { z } from 'zod'

// اعتبارسنجی کاربر
export const userSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر نیست'),
  phone: z.string().optional(),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
})

export const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
})

// اعتبارسنجی سرویس
export const serviceSchema = z.object({
  name: z.string().min(2, 'نام سرویس باید حداقل ۲ کاراکتر باشد'),
  description: z.string().optional(),
  duration: z.number().min(1, 'مدت زمان باید حداقل ۱ دقیقه باشد'),
  price: z.number().min(0, 'قیمت نمی‌تواند منفی باشد').optional(),
  color: z.string().optional(),
})

// اعتبارسنجی شعبه
export const branchSchema = z.object({
  name: z.string().min(2, 'نام شعبه باید حداقل ۲ کاراکتر باشد'),
  address: z.string().min(5, 'آدرس باید حداقل ۵ کاراکتر باشد'),
  phone: z.string().optional(),
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

// اعتبارسنجی پرسنل
// export const staffSchema = z.object({
//   name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
//   email: z.string().email('ایمیل معتبر نیست'),
//   phone: z.string().optional(),
//   specialty: z.string().optional(),
//   bio: z.string().optional(),
//   branchId: z.string().cuid('شعبه معتبر نیست'),
// })

// اعتبارسنجی نوبت
export const appointmentSchema = z.object({
  serviceId: z.string().cuid('سرویس معتبر نیست'),
  branchId: z.string().cuid('شعبه معتبر نیست'),
  staffId: z.string().cuid('پرسنل معتبر نیست').optional(),
  date: z.string().datetime('تاریخ معتبر نیست'),
  notes: z.string().optional(),
})

// اعتبارسنجی کد تخفیف
export const discountCodeSchema = z.object({
  code: z.string().min(3, 'کد باید حداقل ۳ کاراکتر باشد'),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'AMOUNT']),
  discountValue: z.number().min(0, 'مقدار تخفیف نمی‌تواند منفی باشد'),
  maxUses: z.number().min(1, 'حداکثر استفاده باید حداقل ۱ باشد').optional(),
  minAmount: z.number().min(0, 'حداقل مبلغ نمی‌تواند منفی باشد').optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
})

// اعتبارسنجی پاداش
export const rewardSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  description: z.string().optional(),
  pointsCost: z.number().min(1, 'هزینه امتیاز باید حداقل ۱ باشد'),
  discountType: z.enum(['PERCENTAGE', 'AMOUNT']),
  discountValue: z.number().min(0, 'مقدار تخفیف نمی‌تواند منفی باشد'),
  stock: z.number().min(0, 'موجودی نمی‌تواند منفی باشد').optional(),
})

// اعتبارسنجی API Key
export const apiKeySchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
})

// تایپ‌های استنتاج شده
export type UserInput = z.infer<typeof userSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type BranchInput = z.infer<typeof branchSchema>
// export type StaffInput = z.infer<typeof staffSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type DiscountCodeInput = z.infer<typeof discountCodeSchema>
export type RewardInput = z.infer<typeof rewardSchema>
export type ApiKeyInput = z.infer<typeof apiKeySchema>