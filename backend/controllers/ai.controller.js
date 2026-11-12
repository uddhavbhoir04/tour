import mongoose from "mongoose";
import ChatSession from "../models/chatSession.model.js";
import User from "../models/user.model.js";
import { chat } from "../services/ai/assistant.js";
import { aiMinuteLimiter, incrementDailyUsage, getDailyUsage } from "../services/redis.js";
import { env } from "../config/env.js";

const GUEST_HEADER = "x-guest-id";
const validGuestId = (g) => (typeof g === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(g) ? g : null);

/** Identity used for quotas and session ownership */
const identityOf = (req) => {
  if (req.user?.id) return { key: `u:${req.user.id}`, owner: { user: req.user.id } };
  const guestId = validGuestId(req.get(GUEST_HEADER)) || validGuestId(req.body?.guestId);
  return { key: guestId ? `g:${guestId}` : `ip:${req.ip}`, ipKey: `ip:${req.ip}`, owner: guestId ? { guestId, user: null } : null, guestId };
};

// per-minute limit (Upstash, falls back to in-memory express-rate-limit mounted on the route)
export const aiRateLimit = async (req, res, next) => {
  if (!aiMinuteLimiter) return next();
  try {
    const { key } = identityOf(req);
    const { success, reset } = await aiMinuteLimiter.limit(key);
    if (!success) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))));
      return res.status(429).send({ success: false, message: "You're sending messages too fast. Please wait a few seconds." });
    }
    next();
  } catch (err) {
    console.warn("[ai] rate limiter unavailable:", err.message);
    next();
  }
};

export const chatWithAssistant = async (req, res, next) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).send({ success: false, message: "Message is required" });
    if (message.length > env.ai.maxInputChars) {
      return res.status(400).send({ success: false, message: `Message is too long (max ${env.ai.maxInputChars} characters).` });
    }

    const id = identityOf(req);
    // daily quota: guests are also counted per IP so clearing localStorage doesn't reset it
    const used = await incrementDailyUsage(id.key);
    const ipUsed = id.ipKey && id.ipKey !== id.key ? await incrementDailyUsage(id.ipKey) : 0;
    if (used > env.ai.dailyUserLimit || ipUsed > env.ai.dailyUserLimit * 3) {
      return res.status(429).send({
        success: false,
        message: req.user ? "You've reached today's AI message limit. Please try again tomorrow." : "Daily limit reached. Log in for more, or try again tomorrow.",
        remaining: 0,
      });
    }

    // load or create session (must belong to this identity)
    let session = null;
    const { sessionId } = req.body;
    if (sessionId && mongoose.isValidObjectId(sessionId) && id.owner) {
      session = await ChatSession.findOne({ _id: sessionId, ...id.owner });
    }
    if (!session) {
      session = new ChatSession({ ...(id.owner || {}), title: message.slice(0, 60), messages: [] });
    }

    const history = session.messages.slice(-env.ai.contextMessages).map(({ role, content }) => ({ role, content }));
    const user = req.user?.id ? await User.findById(req.user.id).select("username").lean() : null;

    const { reply, suggestedTreks } = await chat({
      history,
      message,
      user: { userId: req.user?.id, username: user?.username },
    });

    session.messages.push({ role: "user", content: message }, { role: "model", content: reply, suggestedTreks });
    // anonymous callers without a guest id get a reply but nothing is persisted
    if (id.owner) await session.save();

    return res.status(200).send({
      success: true,
      reply,
      suggestedTreks,
      sessionId: id.owner ? session._id : null,
      remaining: Math.max(0, env.ai.dailyUserLimit - used),
    });
  } catch (error) {
    if (error?.status === 503) return res.status(503).send({ success: false, message: error.message });
    console.error("[ai] chat failed:", error?.status, error?.message);
    return res.status(502).send({ success: false, message: "The assistant is having trouble right now. Please try again in a moment." });
  }
};

export const getUsage = async (req, res, next) => {
  try {
    const used = await getDailyUsage(identityOf(req).key);
    return res.status(200).send({ success: true, limit: env.ai.dailyUserLimit, used, remaining: Math.max(0, env.ai.dailyUserLimit - used) });
  } catch (error) {
    next(error);
  }
};

export const listSessions = async (req, res, next) => {
  try {
    const { owner } = identityOf(req);
    if (!owner) return res.status(200).send({ success: true, sessions: [] });
    const sessions = await ChatSession.find(owner).select("title updatedAt").sort({ updatedAt: -1 }).limit(30).lean();
    return res.status(200).send({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const { owner } = identityOf(req);
    if (!owner || !mongoose.isValidObjectId(req.params.id)) return res.status(404).send({ success: false, message: "Chat not found" });
    const session = await ChatSession.findOne({ _id: req.params.id, ...owner }).lean();
    if (!session) return res.status(404).send({ success: false, message: "Chat not found" });
    return res.status(200).send({ success: true, session });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const { owner } = identityOf(req);
    if (!owner || !mongoose.isValidObjectId(req.params.id)) return res.status(404).send({ success: false, message: "Chat not found" });
    const r = await ChatSession.deleteOne({ _id: req.params.id, ...owner });
    if (!r.deletedCount) return res.status(404).send({ success: false, message: "Chat not found" });
    return res.status(200).send({ success: true, message: "Chat deleted" });
  } catch (error) {
    next(error);
  }
};

