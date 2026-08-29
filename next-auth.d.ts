/* eslint-disable @typescript-eslint/no-unused-vars */
// src/types/next-auth.d.ts
import { type DefaultSession, type DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { type Role } from "@prisma/client"; // از Role تعریف شده در schema.prisma استفاده کنید

// توسعه (Augment) شیء User در Next-Auth
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: Role; // اضافه کردن فیلد role با نوع Role از Prisma
    // فیلدهای دیگر که در authorize برگردانده می‌شوند را اینجا اضافه کنید
  }

  // توسعه (Augment) شیء Session در Next-Auth
  interface Session extends DefaultSession {
    user: {
      id: string; // از token گرفته شده است
      role: Role; // از token گرفته شده است
    } & DefaultSession["user"];
  }
}

// توسعه (Augment) شیء JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role; // اضافه کردن role به JWT
  }
}