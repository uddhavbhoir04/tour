import express from "express";
import { rateLimit } from "express-rate-limit";
import { optionalAuth } from "../middlewares/authMiddleware.js";
import { aiMinuteLimiter } from "../services/redis.js";
import { env } from "../config/env.js";
import { aiRateLimit, chatWithAssistant, getUsage, listSessions, getSession, deleteSession } from "../controllers/ai.controller.js";

const router = express.Router();

// in-memory fallback when Upstash isn't configured
const memoryLimiter = aiMinuteLimiter
  ? (req, res, next) => next()
  : rateLimit({ windowMs: 60_000, limit: env.ai.ratePerMinute, standardHeaders: "draft-7", legacyHeaders: false, message: { success: false, message: "You're sending messages too fast. Please wait a few seconds." } });

router.use(optionalAuth);
router.post("/chat", memoryLimiter, aiRateLimit, chatWithAssistant);
router.get("/usage", getUsage);
router.get("/sessions", listSessions);
router.get("/sessions/:id", getSession);
router.delete("/sessions/:id", deleteSession);

export default router;
