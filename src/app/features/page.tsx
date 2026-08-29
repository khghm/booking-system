// src/app/features/page.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Header } from "~/components/shared/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Check } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      category: "مدیریت نوبت‌دهی",
      items: [
        "تقویم هوشمند با نمایش زمان‌های خالی",
        "سیستم رزرو آنلاین ۲۴ ساعته",
        "مدیریت چند شعبه",
        "تعریف سرویس‌ها و خدمات مختلف",
        "مدیریت پرسنل و تخصص‌ها"
      ]
    },
    {
      category: "اطلاع‌رسانی و ارتباط",
      items: [
        "یادآوری خودکار از طریق ایمیل و پیامک",
        "چت آنلاین با پشتیبانی",
        "اعلان‌های درون‌برنامه‌ای",
        "سیستم اطلاع‌رسانی Real-time",
        "گزارش‌گیری و آمار پیشرفته"
      ]
    },
    {
      category: "امنیت و مدیریت",
      items: [
        "سیستم احراز هویت امن",
        "مدیریت دسترسی کاربران",
        "پشتیبان‌گیری خودکار",
        "لاگ‌گیری کامل فعالیت‌ها",
        "API برای یکپارچه‌سازی"
      ]
    },
    {
      category: "گزارش‌گیری و آنالیز",
      items: [
        "داشبورد مدیریتی پیشرفته",
        "گزارش‌های مالی و درآمدی",
        "آنالیز عملکرد پرسنل",
        "نمودارها و آمار Real-time",
        "خروجی‌های Excel و PDF"
      ]
    }
  ];

  const pricingPlans = [
    {
      name: "پایه",
      price: "رایگان",
      description: "مناسب برای شروع کار",
      features: [
        "تا ۵۰ نوبت در ماه",
        "۱ شعبه",
        "۲ پرسنل",
        "ایمیل یادآوری",
        "پشتیبانی ایمیلی"
      ]
    },
    {
      name: "حرفه‌ای",
      price: "۲۹۰,۰۰۰ تومان",
      period: "ماهانه",
      description: "مناسب برای کسب‌وکارهای متوسط",
      features: [
        "نوبت‌های نامحدود",
        "تا ۳ شعبه",
        "تا ۱۰ پرسنل",
        "پیامک و ایمیل",
        "پشتیبانی تلفنی",
        "گزارش‌گیری پیشرفته"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "سفارشی",
      description: "مناسب برای سازمان‌های بزرگ",
      features: [
        "همه امکانات حرفه‌ای",
        "شعب نامحدود",
        "پرسنل نامحدود",
        "API دسترسی کامل",
        "پشتیبانی اختصاصی",
        "پیکربندی سفارشی"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            امکانات کامل
            <span className="block text-blue-600"> سامانه نوبت‌یاب</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            تمام ابزارهای مورد نیاز برای مدیریت حرفه‌ای نوبت‌دهی در یک پلتفرم یکپارچه
          </p>
        </div>
      </section>

      {/* ویژگی‌های اصلی */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-12">
          {features.map((category, index) => (
            <div key={index} className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{category.category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {category.items.map((item, itemIndex) => (
                  <Card key={itemIndex} className="text-center">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">{item}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* تعرفه‌ها */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            تعرفه‌های مناسب
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            پلن‌های قیمت‌گذاری متنوع برای نیازهای مختلف
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.popular 
                  ? 'border-2 border-blue-500 shadow-lg scale-105' 
                  : 'border-0 shadow-soft'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    پرفروش
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">/{plan.period}</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 space-x-reverse">
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {plan.price === "رایگان" ? 'شروع رایگان' : 'خرید پلن'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="gradient-primary text-white border-0 shadow-strong">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              آماده شروع هستید؟
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              همین حالا ثبت‌نام کنید و به مدت ۱۴ روز از تمام امکانات به صورت رایگان استفاده کنید.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-8">
                  شروع دوره آزمایشی رایگان
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-blue-600">
                  مشاوره رایگان
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}