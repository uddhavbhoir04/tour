import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "../config/env.js";

export const redis = env.redis.url && env.redis.token ? new Redis({ url: env.redis.url, token: env.redis.token }) : null;
if (!redis) console.warn("⚠️ Upstash Redis not configured — using in-memory limits, no cache");

export const aiMinuteLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(env.ai.ratePerMinute, "1 m"),
      prefix: "ai:rl",
    })
  : null;

const todayKey = () => new Date().toLocaleDateString("en-CA", { timeZone: env.timezone }); // YYYY-MM-DD

// in-memory fallback for the daily quota
const memDaily = new Map();

/** Increments and returns today's AI usage for an identity. */
export const incrementDailyUsage = async (identity) => {
  const key = `ai:daily:${identity}:${todayKey()}`;
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60 * 60 * 26);
    return count;
  }
  const count = (memDaily.get(key) || 0) + 1;
  memDaily.set(key, count);
  return count;
};

export const getDailyUsage = async (identity) => {
  const key = `ai:daily:${identity}:${todayKey()}`;
  if (redis) return Number((await redis.get(key)) || 0);
  return memDaily.get(key) || 0;
};

// ---------- small JSON cache ----------
export const cacheGet = async (key) => {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
};

export const cacheSet = async (key, value, ttlSeconds = env.cacheTtlSeconds) => {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    /* cache is best-effort */
  }
};

export const cacheDelPrefix = async (prefix) => {
  if (!redis) return;
  try {
    let cursor = "0";
    do {
      const [next, keys] = await redis.scan(cursor, { match: `${prefix}*`, count: 100 });
      if (keys.length) await redis.del(...keys);
      cursor = String(next);
    } while (cursor !== "0");
  } catch {
    /* best-effort */
  }
};
