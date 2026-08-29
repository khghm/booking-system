// src/types/css.d.ts

// اعلان برای فایل‌های CSS معمولی
declare module '*.css' {
  // ماژول CSS فقط برای side effects ایمپورت می‌شود و مقدار خاصی Export نمی‌کند
}

// اگر از ماژول‌های CSS (مانند globals.module.css) استفاده می‌کنید، این خط را اضافه کنید:
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}