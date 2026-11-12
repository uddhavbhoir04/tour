import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { env } from "../config/env.js";

export const AUTH_COOKIE = "X_TTMS_access_token";

export const authCookieOptions = {
  httpOnly: true,
  maxAge: 4 * 24 * 60 * 60 * 1000,
  sameSite: env.isProd ? "none" : "lax",
  secure: env.isProd,
};

export const signToken = (id) => jwt.sign({ id }, env.jwtSecret, { expiresIn: "4d" });

export const requireSignIn = (req, res, next) => {
  const token = req?.cookies?.[AUTH_COOKIE];
  if (!token) {
    return res.status(401).send({ success: false, message: "Unauthorized: Token not provided!" });
  }
  jwt.verify(token, env.jwtSecret, (err, user) => {
    if (err) return res.status(403).send({ success: false, message: "Forbidden" });
    req.user = user;
    next();
  });
};

// Decodes the auth cookie if present, never rejects (used by the AI assistant)
export const optionalAuth = (req, _res, next) => {
  const token = req?.cookies?.[AUTH_COOKIE];
  if (!token) return next();
  jwt.verify(token, env.jwtSecret, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("user_role");
    if (user?.user_role === 1) {
      req.isAdmin = true;
      return next();
    }
    return res.status(401).send({ success: false, message: "Unauthorized Access" });
  } catch (error) {
    next(error);
  }
};

// Sets req.isAdmin on optional-auth routes without rejecting guests
export const markAdmin = async (req, _res, next) => {
  try {
    if (req.user) req.isAdmin = (await User.findById(req.user.id).select("user_role"))?.user_role === 1;
    next();
  } catch (error) {
    next(error);
  }
};
