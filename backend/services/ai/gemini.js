import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";

let client = null;
export const getGemini = () => {
  if (!env.gemini.apiKey) throw Object.assign(new Error("AI assistant is not configured"), { status: 503 });
  if (!client) client = new GoogleGenAI({ apiKey: env.gemini.apiKey });
  return client;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Retry on rate limits / server errors / timeouts; anything else (bad request, auth) fails fast
const isRetryable = (err) => {
  const s = Number(err?.status);
  return !s || s === 408 || s === 429 || s >= 500 || err?.name === "AbortError";
};
// A missing/unsupported model should move straight to the next fallback model
const isModelError = (err) => [400, 404].includes(Number(err?.status)) && /model/i.test(err?.message || "");

const withTimeout = async (fn, ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
};

// Models that just returned 429/503 are skipped for a while so every tool round doesn't re-wait on them
const COOLDOWN_MS = 60_000;
const cooldownUntil = new Map();
// rate-limited, overloaded or timed out → try the next model instead of waiting on this one
const isOverloaded = (err) =>
  [429, 503].includes(Number(err?.status)) || err?.name === "AbortError" || /aborted|timed? ?out/i.test(err?.message || "");

/**
 * generateContent with: per-call timeout, retries with backoff, then fallback models.
 * Returns { response, model }.
 */
export const generateWithFallback = async ({ contents, config = {} }) => {
  const ai = getGemini();
  const all = [env.gemini.model, ...env.gemini.fallbackModels];
  const healthy = all.filter((m) => (cooldownUntil.get(m) || 0) < Date.now());
  const models = healthy.length ? healthy : all;
  let lastErr;

  for (const model of models) {
    for (let attempt = 0; attempt <= env.ai.maxRetries; attempt++) {
      try {
        const response = await withTimeout(
          (abortSignal) =>
            ai.models.generateContent({
              model,
              contents,
              config: {
                temperature: env.ai.temperature,
                maxOutputTokens: env.ai.maxOutputTokens,
                ...config,
                abortSignal,
              },
            }),
          env.ai.requestTimeoutMs
        );
        return { response, model };
      } catch (err) {
        lastErr = err;
        console.warn(`[ai] ${model} attempt ${attempt + 1} failed: ${err?.status || ""} ${err?.message}`);
        if (isModelError(err) || !isRetryable(err)) break;
        // overloaded and there's another model to try → switch now instead of retrying
        if (isOverloaded(err) && model !== models[models.length - 1]) {
          cooldownUntil.set(model, Date.now() + COOLDOWN_MS);
          break;
        }
        if (attempt < env.ai.maxRetries) await sleep(500 * 2 ** attempt);
      }
    }
  }
  throw lastErr || new Error("AI request failed");
};

/** Embed one or more texts. taskType: RETRIEVAL_DOCUMENT | RETRIEVAL_QUERY */
export const embedTexts = async (texts, taskType = "RETRIEVAL_DOCUMENT") => {
  const ai = getGemini();
  const out = [];
  // keep batches small to stay within request limits
  for (let i = 0; i < texts.length; i += 50) {
    const batch = texts.slice(i, i + 50);
    const res = await withTimeout(
      (abortSignal) =>
        ai.models.embedContent({
          model: env.gemini.embeddingModel,
          contents: batch,
          config: { taskType, outputDimensionality: env.gemini.embeddingDimensions, abortSignal },
        }),
      env.ai.requestTimeoutMs
    );
    out.push(...(res.embeddings || []).map((e) => e.values));
  }
  return out;
};
