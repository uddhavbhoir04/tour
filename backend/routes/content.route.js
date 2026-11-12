import express from "express";
import { isAdmin, requireSignIn, optionalAuth, markAdmin } from "../middlewares/authMiddleware.js";
import * as c from "../controllers/content.controller.js";

export const settingsRouter = express.Router()
  .get("/", c.getSettings)
  .put("/", requireSignIn, isAdmin, c.updateSettings);

export const blogRouter = express.Router()
  .get("/", optionalAuth, markAdmin, c.listBlogs)
  .get("/:slug", c.getBlog)
  .post("/", requireSignIn, isAdmin, c.createBlog)
  .put("/:id", requireSignIn, isAdmin, c.updateBlog)
  .delete("/:id", requireSignIn, isAdmin, c.deleteBlog);

export const contactRouter = express.Router()
  .post("/", c.createContactMessage)
  .get("/", requireSignIn, isAdmin, c.listContactMessages)
  .patch("/:id", requireSignIn, isAdmin, c.updateContactMessage);

export const adminRouter = express.Router().get("/stats", requireSignIn, isAdmin, c.getAdminStats);
