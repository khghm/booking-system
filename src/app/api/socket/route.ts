// src/app/api/socket/route.ts
import { NextRequest } from "next/server";
import { Server as NetServer } from "http";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { initWebSocket } from "~/lib/websocket";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // این route برای راه‌اندازی WebSocket استفاده می‌شود
  return new Response('WebSocket endpoint', { status: 200 });
}