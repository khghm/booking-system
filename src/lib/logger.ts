// src/lib/logger.ts
import { env } from "~/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const isDevelopment = env.NODE_ENV === "development";

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const payload = meta ? { timestamp, level, message, ...meta } : { timestamp, level, message };

  if (isDevelopment) {
    const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    consoleMethod(JSON.stringify(payload));
  } else {
    if (level === "error") console.error(JSON.stringify(payload));
    else if (level === "warn") console.warn(JSON.stringify(payload));
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (isDevelopment) log("debug", message, meta);
  },
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
  logError: (message: string, error: unknown) => {
    const meta = error instanceof Error ? { error: error.message, stack: error.stack } : { error };
    log("error", message, meta);
  },
  logRequest: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  logAuth: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  logDatabase: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
};
