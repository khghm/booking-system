/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/page.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { Header } from "~/components/shared/Header";
import { ChatWidget } from "~/components/chat/ChatWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const features = [
    {
      icon: CalendarIcon,
      title: "تقویم هوشمند",
      description: "مشاهده زمان‌های خالی و رزرو سریع با تقویم پیشرفته"
    },
    {
      icon: BellIcon,
      title: "یادآوری خودکار",
      description: "دریافت پیامک و ایمیل قبل از وقت ملاقات"
    },
    {
      icon: UsersIcon,
      title: "مدیریت چند شعبه",
      description: "پشتیبانی از چندین شعبه و مدیریت مستقل هر کدام"
    },
    {
      icon: ShieldIcon,
      title: "امنیت بالا",
      description: "سیستم امن با رمزگذاری پیشرفته داده‌ها"
    },
    {
      icon: BarChartIcon,
      title: "گزارش‌گیری پیشرفته",
      description: "آنالیز و گزارش‌گیری حرفه‌ای از عملکرد سیستم"
    },
    {
      icon: SmartphoneIcon,
      title: "پشتیبانی موبایل",
      description: "تجربه کاربری عالی در دستگاه‌های موبایل"
    }
  ];

  const stats = [
    { number: "۱۰,۰۰۰+", label: "نوبت رزرو شده" },
    { number: "۵۰۰+", label: "کاربر فعال" },
    { number: "۹۸%", label: "رضایت کاربران" },
    { number: "۲۴/۷", label: "پشتیبانی آنلاین" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            🚀 سیستم نوبت‌دهی هوشمند
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            مدیریت حرفه‌ای
            <span className="block text-blue-600"> نوبت‌دهی آنلاین</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            با سامانه نوبت‌یاب، زمان‌بندی و مدیریت قرار ملاقات‌ها را به ساده‌ترین شکل ممکن تجربه کنید. 
            سیستم جامع ما برای کلینیک‌ها، مطب‌ها و کسب‌وکارهای خدماتی طراحی شده است.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {session ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="px-8">
                    پنل کاربری
                  </Button>
                </Link>
                <Link href="/bookings">
                  <Button variant="outline" size="lg" className="px-8">
                    رزرو نوبت جدید
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="px-8">
                    شروع کنید - رایگان
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="px-8">
                    ورود به سیستم
                  </Button>
                </Link>
              </>
            )}
            <Link href="/features">
              <Button variant="ghost" size="lg" className="px-8">
                امکانات بیشتر
              </Button>
            </Link>
          </div>
        </div>

        {/* آمار و ارقام */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ویژگی‌ها */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            چرا سامانه نوبت‌یاب؟
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            تمام ابزارهای مورد نیاز برای مدیریت حرفه‌ای نوبت‌دهی در یک پلتفرم
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover border-0 shadow-soft">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="gradient-primary text-white border-0 shadow-strong">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              آماده شروع هستید؟
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              همین حالا به جامعه هزاران کاربر سامانه نوبت‌یاب بپیوندید و مدیریت نوبت‌دهی خود را متحول کنید.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session && (
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="px-8">
                    ثبت‌نام رایگان
                  </Button>
                </Link>
              )}
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-blue-600">
                  تماس با پشتیبانی
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ویجت چت */}
      <ChatWidget />
    </div>
  );
}

// آیکون‌های سفارشی
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.77-4.11 1 1 0 00-1.94-.5 7.97 7.97 0 005.04 5.48 1 1 0 00.67-1.87z" />
    </svg>
  );
}
function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SmartphoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}