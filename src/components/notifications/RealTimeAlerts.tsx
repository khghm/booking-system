/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/components/notifications/RealTimeAlerts.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Bell, X, Calendar, AlertTriangle } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export function RealTimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // شبیه‌سازی اتصال به WebSocket برای هشدارها
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001");

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to alerts WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      const newAlert: Alert = {
        id: Date.now().toString(),
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        timestamp: new Date(),
        data: data.data,
      };

      setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // نگه‌داری فقط ۵ هشدار آخر

      // نمایش toast برای هشدارهای مهم
      if (data.type === 'warning' || data.type === 'error') {
        toast({
          title: data.title,
          description: data.message,
          variant: data.type === 'error' ? 'destructive' : 'default',
        });
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from alerts WebSocket');
    };

    return () => {
      ws.close();
    };
  }, [toast]);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">هشدارهای لحظه‌ای</CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "متصل" : "قطع"}
          </Badge>
        </div>
        <CardDescription>
          آخرین رویدادها و هشدارهای سیستم
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>هیچ هشداری وجود ندارد</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'error' 
                      ? 'border-red-200 bg-red-50' 
                      : alert.type === 'warning'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getAlertIcon(alert.type)}
                      <span className="font-medium text-sm">{alert.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeAlert(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.message}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                      {alert.type === 'error' ? 'خطا' : alert.type === 'warning' ? 'هشدار' : 'اطلاع'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString('fa-IR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}