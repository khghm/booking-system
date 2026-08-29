/* eslint-disable @typescript-eslint/no-floating-promises */
// src/components/api/ApiDocumentation.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Copy, Check, BookOpen, Key, Code, Terminal } from "lucide-react";

export function ApiDocumentation() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/appointments",
      description: "دریافت لیست نوبت‌ها",
      parameters: [
        { name: "page", type: "number", required: false, description: "شماره صفحه" },
        { name: "limit", type: "number", required: false, description: "تعداد در هر صفحه" },
        { name: "status", type: "string", required: false, description: "فیلتر بر اساس وضعیت" },
      ]
    },
    {
      method: "POST",
      path: "/api/v1/appointments",
      description: "ایجاد نوبت جدید",
      body: {
        serviceId: "string (required)",
        branchId: "string (required)",
        date: "string (ISO datetime)",
        notes: "string (optional)"
      }
    },
    {
      method: "GET",
      path: "/api/v1/services",
      description: "دریافت لیست سرویس‌ها"
    },
    {
      method: "GET",
      path: "/api/v1/branches",
      description: "دریافت لیست شعب"
    },
    {
      method: "GET",
      path: "/api/v1/users/profile",
      description: "دریافت پروفایل کاربر"
    }
  ];

  const curlExample = `curl -X GET \\
  -H "X-API-Key: your_api_key_here" \\
  "https://yourdomain.com/api/v1/appointments?page=1&limit=10"`;

  const javascriptExample = `const response = await fetch('/api/v1/appointments', {
  method: 'GET',
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;

  const pythonExample = `import requests

headers = {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://yourdomain.com/api/v1/appointments',
    headers=headers,
    params={'page': 1, 'limit': 10}
)

data = response.json()
print(data)`;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground text-lg">
          مستندات کامل API برای یکپارچه‌سازی با سیستم نوبت‌دهی
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BookOpen className="ml-2 h-4 w-4" />
            بررسی کلی
          </TabsTrigger>
          <TabsTrigger value="endpoints">
            <Code className="ml-2 h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="examples">
            <Terminal className="ml-2 h-4 w-4" />
            مثال‌ها
          </TabsTrigger>
          <TabsTrigger value="authentication">
            <Key className="ml-2 h-4 w-4" />
            احراز هویت
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>معرفی API</CardTitle>
              <CardDescription>
                RESTful API برای یکپارچه‌سازی سیستم نوبت‌دهی با برنامه‌های دیگر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Badge variant="secondary" className="mb-2">Base URL</Badge>
                  <code className="text-sm">/api/v1</code>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge variant="secondary" className="mb-2">Format</Badge>
                  <code className="text-sm">JSON</code>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge variant="secondary" className="mb-2">Auth</Badge>
                  <code className="text-sm">API Key</code>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">نکات مهم:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>تمامی درخواست‌ها باید شامل هدر X-API-Key باشند</li>
                  <li>داده‌ها به فرمت JSON ارسال و دریافت می‌شوند</li>
                  <li>کدهای وضعیت HTTP برای نشان دادن نتیجه استفاده می‌شوند</li>
                  <li>محدودیت نرخ درخواست: ۱۰۰۰ درخواست در ساعت</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Badge
                      variant={
                        endpoint.method === "GET" ? "default" :
                        endpoint.method === "POST" ? "secondary" :
                        endpoint.method === "PUT" ? "outline" : "destructive"
                      }
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {endpoint.path}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(endpoint.path, endpoint.path)}
                  >
                    {copiedEndpoint === endpoint.path ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {endpoint.parameters && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">پارامترها:</h4>
                    <div className="space-y-1">
                      {endpoint.parameters.map((param, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                          <code className="bg-background px-2 py-1 rounded text-xs">{param.name}</code>
                          <span className="text-muted-foreground">{param.type}</span>
                          <Badge variant={param.required ? "default" : "outline"} className="text-xs">
                            {param.required ? "الزامی" : "اختیاری"}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex-1 text-left mr-2">
                            {param.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {endpoint.body && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">بدن درخواست:</h4>
                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(endpoint.body, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">پاسخ نمونه:</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مثال‌های کد</CardTitle>
              <CardDescription>
                نمونه کد برای یکپارچه‌سازی با زبان‌های برنامه‌نویسی مختلف
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* cURL */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">cURL</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(curlExample, "curl")}
                  >
                    {copiedEndpoint === "curl" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto font-mono">
                  {curlExample}
                </pre>
              </div>

              {/* JavaScript */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">JavaScript</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(javascriptExample, "javascript")}
                  >
                    {copiedEndpoint === "javascript" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto font-mono">
                  {javascriptExample}
                </pre>
              </div>

              {/* Python */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Python</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(pythonExample, "python")}
                  >
                    {copiedEndpoint === "python" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto font-mono">
                  {pythonExample}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>احراز هویت API</CardTitle>
              <CardDescription>
                استفاده از API Key برای دسترسی به endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">نحوه استفاده:</h4>
                <p className="text-sm mb-3">
                  کلید API خود را در هدر درخواست‌ها ارسال کنید:
                </p>
                <code className="text-sm bg-background p-2 rounded block font-mono">
                  X-API-Key: your_api_key_here
                </code>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">محدودیت‌ها:</h4>
                <ul className="text-sm space-y-2 list-disc list-inside">
                  <li><strong>۱۰۰۰ درخواست در ساعت</strong> برای هر کلید API</li>
                  <li><strong>حداکثر ۱۰ کلید API فعال</strong> برای هر کاربر</li>
                  <li>کلیدهای API قابل غیرفعال‌سازی هستند</li>
                  <li>لاگ کامل درخواست‌ها نگهداری می‌شود</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium mb-2 text-blue-800">کدهای وضعیت:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">200</code>
                    <span>موفق - درخواست با موفقیت پردازش شد</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">400</code>
                    <span>درخواست نامعتبر - داده‌های ورودی مشکل دارند</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-red-100 text-red-800 px-2 py-1 rounded">401</code>
                    <span>غیرمجاز - کلید API معتبر نیست</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-red-100 text-red-800 px-2 py-1 rounded">403</code>
                    <span>ممنوع - دسترسی به منبع مورد نظر ندارید</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-red-100 text-red-800 px-2 py-1 rounded">429</code>
                    <span>تعداد درخواست بیش از حد - محدودیت نرخ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-red-100 text-red-800 px-2 py-1 rounded">500</code>
                    <span>خطای سرور - مشکل داخلی سرور</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* بخش مدیریت کلیدهای API */}
      <Card>
        <CardHeader>
          <CardTitle>مدیریت کلیدهای API</CardTitle>
          <CardDescription>
            ایجاد و مدیریت کلیدهای API شخصی
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">کلیدهای API شما</h4>
              <p className="text-sm text-muted-foreground mb-4">
                برای ایجاد کلید API جدید، از پنل کاربری خود اقدام کنید.
              </p>
              <Button asChild>
                <a href="/dashboard/api-keys">
                  مدیریت کلیدهای API
                </a>
              </Button>
            </div>

            <div className="p-4 border rounded-lg bg-amber-50">
              <h4 className="font-medium mb-2 text-amber-800">نکات امنیتی</h4>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li>کلیدهای API مانند رمز عبور هستند - آن‌ها را محرمانه نگه دارید</li>
                <li>هرگز کلیدهای API را در کد سمت کلاینت قرار ندهید</li>
                <li>کلیدهای به‌سرقت رفته را فوراً غیرفعال کنید</li>
                <li>برای محیط‌های مختلف (توسعه، تست، تولید) کلیدهای جداگانه ایجاد کنید</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}