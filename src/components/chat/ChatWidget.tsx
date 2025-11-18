// src/components/chat/ChatWidget.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Send, MessageCircle, X, Bot, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "~/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isRead: boolean;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const { toast } = useToast();

  // بارگذاری پیام‌های اولیه
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        text: 'سلام! به پشتیبانی آنلاین خوش آمدید. چطور می‌توانم کمک کنم؟',
        sender: 'assistant',
        timestamp: new Date(),
        isRead: true
      }
    ];
    setMessages(initialMessages);
  }, []);

  // اسکرول به پایین هنگام اضافه شدن پیام جدید
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !session) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      isRead: true
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      // شبیه‌سازی پاسخ ربات
      setTimeout(() => {
        const responses = [
            "متشکرم از پیام شما. تیم پشتیبانی به زودی با شما تماس خواهد گرفت.",
            "سوال خوبی پرسیدید. برای اطلاعات بیشتر می‌توانید با شماره ۰۲۱-۱۲۳۴۵۶۷۸ تماس بگیرید.",
            "این درخواست شما ثبت شد. همکاران ما در اسرع وقت رسیدگی خواهند کرد.",
            "برای حل این مشکل، لطفاً از بخش تنظیمات حساب کاربری خود اقدام کنید.",
            "ساعت کاری پشتیبانی: شنبه تا چهارشنبه از ۸ صبح تا ۵ عصر"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: 'assistant',
          timestamp: new Date(),
          isRead: false
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ارسال پیام",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* دکمه شناور چت */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* ویجت چت */}
      {isOpen && (
        <Card className="fixed bottom-6 left-6 w-80 h-96 shadow-xl z-50">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <MessageCircle className="ml-2 h-5 w-5 text-blue-600" />
                  پشتیبانی آنلاین
                </CardTitle>
                <CardDescription>
                  <Badge variant="default" className="text-xs">
                    آنلاین
                  </Badge>
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-80">
            {/* بخش پیام‌ها */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-3 py-2 flex items-start space-x-2 space-x-reverse ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.sender === 'assistant' && (
                      <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('fa-IR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <User className="h-4 w-4 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center space-x-2 space-x-reverse">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* فرم ارسال پیام */}
            <form onSubmit={sendMessage} className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!newMessage.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                پشتیبانی ۲۴/۷ - پاسخگویی در کمترین زمان
              </p>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}