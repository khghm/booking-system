// src/lib/rate-limit.ts
type RateLimitConfig = {
  interval: number;
  limit: number;
};

type Entry = {
  count: number;
  resetTime: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
};

type RateLimiter = {
  check: (identifier: string) => RateLimitResult;
  config?: RateLimitConfig;
};

const store = new Map<string, Entry>();

const presets: Record<string, RateLimitConfig> = {
  auth: { interval: 60_000, limit: 5 },
  admin: { interval: 60_000, limit: 30 },
  api: { interval: 60_000, limit: 100 },
  strict: { interval: 60_000, limit: 10 },
};

function checkLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + config.interval,
    });
    return { success: true, remaining: config.limit - 1 };
  }

  entry.count += 1;

  if (entry.count > config.limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: config.limit - entry.count };
}

export function getRateLimit(preset: keyof typeof presets): RateLimiter;
export function getRateLimit(key: string, config: RateLimitConfig): RateLimiter;
export function getRateLimit(presetOrKey: keyof typeof presets | string, config?: RateLimitConfig): RateLimiter {
  let resolvedConfig: RateLimitConfig | undefined;

  if (config) {
    resolvedConfig = config;
  } else if (presetOrKey in presets) {
    resolvedConfig = presets[presetOrKey as keyof typeof presets];
  }

  if (!resolvedConfig) {
    resolvedConfig = { interval: 60_000, limit: 10 };
  }

  return {
    check: (identifier: string) => checkLimit(identifier, resolvedConfig!),
    config: resolvedConfig,
  };
}

export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return {
    check: (identifier: string) => checkLimit(identifier, config),
    config,
  };
}
