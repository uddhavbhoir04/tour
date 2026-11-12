import { env } from "../config/env.js";
import mongoose from "mongoose";
import Package, { slugify } from "../models/package.model.js";
import SiteSettings from "../models/siteSettings.model.js";
import Blog from "../models/blog.model.js";
import { TREK_PACKAGES } from "./treks.data.js";
import { BASE_TREKS } from "./legacyTreks.data.js";
import { SITE_SETTINGS, BLOG_POSTS, TREK_CATEGORIES } from "./site.data.js";
import { reindexAll } from "../services/ai/rag.js";
import { TOP_CAMPING_AND_TREK_PACKAGES } from "./camping.data.js";
import { cacheDelPrefix } from "../services/redis.js";

const run = async () => {
  await mongoose.connect(env.mongoUrl);
  console.log(`Connected to ${mongoose.connection.name}`);

  // camping packages carry display labels as categories → convert to keys, plus the existing pill keys
  const campingKeys = (p) => {
    const keys = new Set((p.categories || []).map(slugify));
    if (keys.has("jungle-trek")) keys.add("jungle");
    if (/^easy/i.test(p.difficulty || "")) keys.add("easy");
    return [...keys];
  };
  const allTreks = [
    ...TREK_PACKAGES.map((t) => ({ ...(BASE_TREKS.find((b) => b.packageName === t.packageName) || {}), ...t, categories: TREK_CATEGORIES[t.slug] || [] })),
    ...TOP_CAMPING_AND_TREK_PACKAGES.map((t) => ({ ...t, categories: campingKeys(t) })),
  ];

  for (const { _id, ...trek } of allTreks) {
    const doc = { ...trek, isActive: true };
    // match by slug, or by name for packages created before slugs existed
    const existing = await Package.findOne({ $or: [{ slug: trek.slug }, { packageName: trek.packageName }] });
    if (existing) {
      existing.set(doc);
      await existing.save();
      console.log(`↻ updated ${trek.slug}`);
    } else {
      await Package.create(doc);
      console.log(`+ created ${trek.slug}`);
    }
  }

  // backfill slugs on any other legacy packages
  for (const p of await Package.find({ $or: [{ slug: { $exists: false } }, { slug: null }] })) {
    await p.validate();
    await p.save();
    console.log(`↻ slug added: ${p.slug}`);
  }

  await SiteSettings.findOneAndUpdate({ key: "main" }, { $set: SITE_SETTINGS }, { upsert: true });
  console.log("✓ site settings");

  for (const post of BLOG_POSTS) {
    await Blog.findOneAndUpdate({ slug: post.slug }, { $setOnInsert: post }, { upsert: true });
  }
  console.log(`✓ ${BLOG_POSTS.length} blog posts`);

  await Package.syncIndexes();
  const chunks = await reindexAll();
  console.log(`✓ indexed ${chunks} knowledge chunks for the AI assistant`);

  // the API caches packages/settings for days — clear so seeded changes show immediately
  await cacheDelPrefix("pkg:");
  await cacheDelPrefix("settings:");
  console.log("✓ cache cleared");

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
