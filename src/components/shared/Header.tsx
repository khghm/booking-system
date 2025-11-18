// src/components/shared/Header.tsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { User, Settings, LogOut, Calendar } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 space-x-reverse">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">نوبت‌یاب</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            <Link href="/bookings" className="text-gray-700 hover:text-blue-600 transition-colors">
              رزرو نوبت
            </Link>
            {session && (
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                پنل کاربری
              </Link>
            )}
            {session?.user.role === "ADMIN" && (
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                مدیریت
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-3 space-x-reverse">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">
                        {session.user.name || session.user.email}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <Settings className="ml-2 h-4 w-4" />
                      پنل کاربری
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="ml-2 h-4 w-4" />
                        پنل مدیریت
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    خروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    ورود
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    ثبت‌نام
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}