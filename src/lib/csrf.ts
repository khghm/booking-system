// src/lib/csrf.ts
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TOKEN_LENGTH = 32;

export function generateCsrfToken(): string {
  const bytes = new Uint8Array(CSRF_TOKEN_LENGTH);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < CSRF_TOKEN_LENGTH; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function setCsrfTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function getCsrfTokenFromRequest(request: Request): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value ?? null;

  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) return null;

  return validateCsrfToken(cookieToken, headerToken) ? cookieToken : null;
}

export function validateCsrfToken(cookieToken: string, headerToken: string | null): boolean {
  if (!headerToken) return false;
  return cookieToken === headerToken;
}

export function getCsrfTokenHeaderName(): string {
  return CSRF_HEADER_NAME;
}

export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME;
}
