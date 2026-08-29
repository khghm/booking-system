// src/app/api/socket/route.ts
import type { NextRequest } from "next/server";
import { logger } from "~/lib/logger";

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  logger.debug("WebSocket endpoint accessed");
  return new Response('WebSocket endpoint', { status: 200 });
}
