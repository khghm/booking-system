/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/layout.tsx
import "~/styles/globals.css";
import { Inter } from "next/font/google";
import { Providers } from "~/components/providers/Providers";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: {
    default: "سامانه نوبت‌یاب | سیستم مدیریت نوبت‌دهی",
    template: "%s | سامانه نوبت‌یاب"
  },
  description: "سیستم جامع مدیریت و رزرو قرار ملاقات - نوبت‌دهی هوشمند و آنلاین",
  keywords: ["نوبت‌دهی", "رزرو", "قرار ملاقات", "مدیریت زمان", "سیستم نوبت‌دهی"],
  authors: [{ name: "Booking System Team" }],
  creator: "Booking System",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://yourdomain.com",
    title: "سامانه نوبت‌یاب",
    description: "سیستم جامع مدیریت و رزرو قرار ملاقات",
    siteName: "سامانه نوبت‌یاب",
  },
  twitter: {
    card: "summary_large_image",
    title: "سامانه نوبت‌یاب",
    description: "سیستم جامع مدیریت و رزرو قرار ملاقات",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fa" dir="rtl" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}