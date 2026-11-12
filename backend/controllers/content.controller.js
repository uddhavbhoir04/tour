import SiteSettings from "../models/siteSettings.model.js";
import Blog from "../models/blog.model.js";
import ContactMessage from "../models/contactMessage.model.js";
import Booking from "../models/booking.model.js";
import Package, { slugify } from "../models/package.model.js";
import User from "../models/user.model.js";
import { cacheGet, cacheSet, cacheDelPrefix } from "../services/redis.js";
import { sendContactToAdmin } from "../services/email.js";
import { indexSettings, indexBlog, removeSource, reindexInBackground } from "../services/ai/rag.js";

// ---------------- settings ----------------
export const getSettings = async (req, res, next) => {
  try {
    const cached = await cacheGet("settings:main");
    if (cached) return res.status(200).send(cached);
    const settings = await SiteSettings.findOne({ key: "main" }).lean();
    if (!settings) return res.status(404).send({ success: false, message: "Site settings not configured. Run npm run seed." });
    const payload = { success: true, settings };
    await cacheSet("settings:main", payload);
    return res.status(200).send(payload);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { _id, key, createdAt, updatedAt, __v, ...data } = req.body || {};
    const settings = await SiteSettings.findOneAndUpdate({ key: "main" }, { $set: data }, { new: true, upsert: true, runValidators: true });
    await cacheDelPrefix("settings:");
    reindexInBackground(() => indexSettings(settings));
    return res.status(200).send({ success: true, message: "Settings saved", settings });
  } catch (error) {
    next(error);
  }
};

// ---------------- blog ----------------
export const listBlogs = async (req, res, next) => {
  try {
    const all = req.query.all === "1" && req.isAdmin;
    const posts = await Blog.find(all ? {} : { published: true }).sort({ createdAt: -1 }).lean();
    return res.status(200).send({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

export const getBlog = async (req, res, next) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, published: true }).lean();
    if (!post) return res.status(404).send({ success: false, message: "Post not found" });
    return res.status(200).send({ success: true, post });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, coverImage, author, published = true } = req.body;
    if (!title || !content) return res.status(400).send({ success: false, message: "Title and content are required" });
    let slug = slugify(req.body.slug || title);
    if (await Blog.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`;
    const post = await Blog.create({ title, slug, excerpt, content, coverImage, author, published });
    reindexInBackground(() => indexBlog(post));
    return res.status(201).send({ success: true, post });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { _id, createdAt, updatedAt, __v, ...data } = req.body || {};
    if (data.slug) data.slug = slugify(data.slug);
    const post = await Blog.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!post) return res.status(404).send({ success: false, message: "Post not found" });
    reindexInBackground(() => indexBlog(post));
    return res.status(200).send({ success: true, post });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const post = await Blog.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).send({ success: false, message: "Post not found" });
    reindexInBackground(() => removeSource("blog", String(post._id)));
    return res.status(200).send({ success: true, message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};

// ---------------- contact ----------------
export const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).send({ success: false, message: "Name, email and message are required" });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).send({ success: false, message: "Enter a valid email" });
    if (String(message).length > 5000) return res.status(400).send({ success: false, message: "Message is too long" });
    const msg = await ContactMessage.create({ name, email, phone, subject, message });
    sendContactToAdmin(msg);
    return res.status(201).send({ success: true, message: "Thanks! We'll get back to you soon." });
  } catch (error) {
    next(error);
  }
};

export const listContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find(req.query.status ? { status: req.query.status } : {}).sort({ createdAt: -1 }).limit(200).lean();
    return res.status(200).send({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

export const updateContactMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!msg) return res.status(404).send({ success: false, message: "Message not found" });
    return res.status(200).send({ success: true, message: msg });
  } catch (error) {
    next(error);
  }
};

// ---------------- admin stats ----------------
export const getAdminStats = async (req, res, next) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 11, 1);
    const sinceStr = since.toISOString().slice(0, 7);

    const [users, packages, bookings, pendingPayments, newMessages, revenue, monthly] = await Promise.all([
      User.countDocuments({ user_role: 0 }),
      Package.countDocuments({ isActive: { $ne: false } }),
      Booking.countDocuments({ status: { $ne: "Cancelled" } }),
      Booking.countDocuments({ paymentStatus: "Pending", status: { $in: ["Pending", "Booked"] } }),
      ContactMessage.countDocuments({ status: "New" }),
      Booking.aggregate([{ $match: { status: { $ne: "Cancelled" } } }, { $group: { _id: null, total: { $sum: "$totalPrice" }, persons: { $sum: "$persons" } } }]),
      Booking.aggregate([
        { $match: { status: { $ne: "Cancelled" }, date: { $gte: sinceStr } } },
        { $group: { _id: { $substr: ["$date", 0, 7] }, bookings: { $sum: 1 }, persons: { $sum: "$persons" }, revenue: { $sum: "$totalPrice" } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    return res.status(200).send({
      success: true,
      stats: {
        users,
        packages,
        bookings,
        pendingPayments,
        newMessages,
        revenue: revenue[0]?.total || 0,
        trekkers: revenue[0]?.persons || 0,
        monthly: monthly.map((m) => ({ month: m._id, bookings: m.bookings, persons: m.persons, revenue: m.revenue })),
      },
    });
  } catch (error) {
    next(error);
  }
};
