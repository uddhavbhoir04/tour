import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Root .env (tour-main/.env) is the single source of truth
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const num = (v, d) => (v === undefined || v === "" || isNaN(Number(v)) ? d : Number(v));
const bool = (v, d) => (v === undefined || v === "" ? d : String(v).toLowerCase() === "true");
const list = (v) => (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : []);

const required = ["MONGO_URL", "JWT_SECRET"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

export const env = {
  port: num(process.env.PORT, 8000),
  isProd: process.env.NODE_ENV_CUSTOM === "production",
  clientUrls: list(process.env.CLIENT_URLS || process.env.SERVER_URL || "http://localhost:5173"),
  timezone: process.env.APP_TIMEZONE || "Asia/Kolkata",
  mongoUrl: process.env.MONGO_URL,
  cacheTtlSeconds: num(process.env.CACHE_TTL_SECONDS, 259200), // 3 days
  jwtSecret: process.env.JWT_SECRET,

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    fallbackModels: list(process.env.GEMINI_FALLBACK_MODELS),
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
    embeddingDimensions: num(process.env.GEMINI_EMBEDDING_DIMENSIONS, 768),
  },
  ai: {
    maxOutputTokens: num(process.env.AI_MAX_OUTPUT_TOKENS, 2048),
    temperature: num(process.env.AI_TEMPERATURE, 0.3),
    requestTimeoutMs: num(process.env.AI_REQUEST_TIMEOUT_MS, 30000),
    maxRetries: num(process.env.AI_MAX_RETRIES, 2),
    dailyUserLimit: num(process.env.AI_DAILY_USER_LIMIT, 20),
    ratePerMinute: num(process.env.AI_RATE_LIMIT_PER_MINUTE, 6),
    maxInputChars: num(process.env.AI_MAX_INPUT_CHARS, 4000),
    contextMessages: num(process.env.AI_CONTEXT_MESSAGES, 10),
  },
  rag: {
    topK: num(process.env.RAG_TOP_K, 4),
    similarityThreshold: num(process.env.RAG_SIMILARITY_THRESHOLD, 0.65),
    keywordMinCoverage: num(process.env.RAG_KEYWORD_MIN_COVERAGE, 0.5),
    qdrantUrl: process.env.QDRANT_URL || "",
    qdrantApiKey: process.env.QDRANT_API_KEY || "",
    qdrantCollection: process.env.QDRANT_COLLECTION || "roamingbirds_knowledge",
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || "resend",
    resendApiKey: process.env.RESEND_API_KEY || "",
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    adminEmail: process.env.ADMIN_EMAIL || "",
    enabled: bool(process.env.NOTIFICATION_EMAIL_ENABLED, true),
    reminderHours: num(process.env.TREK_REMINDER_HOURS, 24),
  },
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  },
};

if (!env.gemini.apiKey) console.warn("⚠️ GEMINI_API_KEY not set — AI assistant disabled");
