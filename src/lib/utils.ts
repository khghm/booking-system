/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// فرمت‌دهی تاریخ به فارسی
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

// فرمت‌دهی اعداد به فارسی
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fa-IR').format(num)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency: 'IRR'
  }).format(amount)
}

// تولید ID منحصر به فرد
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// اعتبارسنجی ایمیل
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// اعتبارسنجی شماره تلفن ایرانی
export function isValidIranianPhone(phone: string): boolean {
  const phoneRegex = /^09[0-9]{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// محاسبه تاریخ پایان بر اساس مدت زمان
export function calculateEndDate(startDate: Date, durationMinutes: number): Date {
  return new Date(startDate.getTime() + durationMinutes * 60000);
}

// بررسی تداخل زمانی
export function hasTimeOverlap(
  start1: Date, 
  end1: Date, 
  start2: Date, 
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1
}

// تبدیل دقیقه به فرمت ساعت:دقیقه
export function minutesToTimeFormat(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// تبدیل زمان رشته‌ای به دقیقه
export function timeFormatToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// تولید رنگ تصادفی
export function generateRandomColor(): string {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// خلاصه کردن متن
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// ایجاد delay
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// گرفتن اول متن (برای آواتار)
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// فرمت‌دهی فایل سایز
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// تابع ایمن برای محاسبه تاریخ پایان
export function safeCalculateEndDate(startDate: Date, durationMinutes: number | undefined | null): Date {
  const duration = durationMinutes || 0; // اگر undefined یا null بود، 0 در نظر بگیر
  return new Date(startDate.getTime() + duration * 60000);
}