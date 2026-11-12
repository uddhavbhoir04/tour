import KnowledgeChunk from "../../models/knowledgeChunk.model.js";
import Package from "../../models/package.model.js";
import SiteSettings from "../../models/siteSettings.model.js";
import Blog from "../../models/blog.model.js";
import { embedTexts } from "./gemini.js";
import { env } from "../../config/env.js";

// ---------------- chunking ----------------
const list = (title, items) => (items?.length ? `${title}:\n- ${items.join("\n- ")}` : "");
const pickups = (city, p) => (p?.length ? `${city} pickup points:\n${p.map((x) => `- ${x.time} ${x.location}`).join("\n")}` : "");

export const packageChunks = (p) => {
  const head = `Trek: ${p.packageName} (slug: ${p.slug})`;
  const overview = [
    head,
    p.tagline,
    p.packageDescription,
    `Destination: ${p.packageDestination}. Region: ${p.region || "-"}. Base village: ${p.baseVillage || "-"}.`,
    `Difficulty: ${p.difficulty || "-"}. Endurance: ${p.endurance || "-"}. Trail: ${p.trailType || "-"}, ${p.trailLength || "-"}, ${p.duration || "-"}.`,
    `Best time: ${p.bestTime || "-"}. Schedule: ${p.batchSchedule || "-"}. Duration: ${p.packageDays}D/${p.packageNights}N.`,
    `Price: Mumbai ₹${p.mumbaiPrice ?? p.packagePrice}, Pune ₹${p.punePrice ?? p.packageDiscountPrice}, advance ₹${p.advanceAmount}.`,
    `Meals: ${p.packageMeals}. Transport: ${p.packageTransportation}. Stay: ${p.packageAccommodation}. Activities: ${p.packageActivities}.`,
  ].filter(Boolean).join("\n");

  const itinerary = p.itinerary?.length
    ? `${head}\nItinerary:\n${p.itinerary.map((d) => `${d.day} — ${d.title}\n${(d.items || []).map((i) => `  - ${i}`).join("\n")}`).join("\n")}`
    : "";

  return [
    { title: `${p.packageName} — overview`, text: overview },
    { title: `${p.packageName} — itinerary`, text: itinerary },
    { title: `${p.packageName} — pickups`, text: [head, pickups("Mumbai", p.mumbaiPickups), pickups("Pune", p.punePickups)].filter(Boolean).join("\n") },
    { title: `${p.packageName} — inclusions`, text: [head, list("Inclusions", p.inclusions), list("Exclusions", p.exclusions)].filter(Boolean).join("\n") },
    { title: `${p.packageName} — what to carry & rules`, text: [head, list("What to carry", p.whatToCarry), list("Important rules", p.importantRules)].filter(Boolean).join("\n") },
  ].filter((c) => c.text.split("\n").length > 1);
};

const settingsChunks = (s) => [
  {
    title: "Contact & booking info",
    text: [
      `${s.brandName} — ${s.tagline || ""}`,
      `Phone: ${s.primaryPhone}. WhatsApp: +${s.whatsappNumber}. ${s.contacts?.map((c) => `${c.name}: ${c.phone}`).join(", ") || ""}`,
      `UPI: ${s.upiNumber} / ${s.upiId} (${s.upiHolderName}). Instagram: ${s.instagram || "-"}.`,
      `Rating ${s.googleReviewsRating} from ${s.reviewsCount} Google reviews, ${s.trekkersCount} trekkers.`,
      s.announcement,
      list("How to book", (s.bookingSteps || []).map((b) => `${b.title}: ${b.description}`)),
    ].filter(Boolean).join("\n"),
  },
  {
    title: "Common pickup points",
    text: [pickups("Mumbai", s.mumbaiPickups), pickups("Pune", s.punePickups)].filter(Boolean).join("\n"),
  },
  {
    title: "Why choose us",
    text: [...(s.aboutText || []), list("Highlights", (s.whyChooseUs || []).map((w) => `${w.title}: ${w.description}`))].join("\n"),
  },
].filter((c) => c.text.trim());

const blogChunks = (b) => [{ title: b.title, text: `Article: ${b.title}\n${b.excerpt || ""}\n${b.content || ""}` }];

// ---------------- qdrant (optional) ----------------
const qdrant = async (path, body, method = "POST") => {
  const res = await fetch(`${env.rag.qdrantUrl.replace(/\/$/, "")}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(env.rag.qdrantApiKey ? { "api-key": env.rag.qdrantApiKey } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Qdrant ${path} ${res.status}`);
  return res.json();
};
const useQdrant = () => Boolean(env.rag.qdrantUrl);
const ensureQdrantCollection = async () => {
  try {
    await qdrant(`/collections/${env.rag.qdrantCollection}`, null, "GET");
  } catch {
    await qdrant(`/collections/${env.rag.qdrantCollection}`, { vectors: { size: env.gemini.embeddingDimensions, distance: "Cosine" } }, "PUT");
  }
};

// ---------------- indexing ----------------
/** Replace all chunks for a source. Embeddings are best-effort: chunks are always saved for keyword search. */
const indexSource = async (sourceType, sourceId, slug, chunks) => {
  await KnowledgeChunk.deleteMany({ sourceType, sourceId });
  if (!chunks.length) return 0;

  let vectors = [];
  try {
    vectors = await embedTexts(chunks.map((c) => c.text), "RETRIEVAL_DOCUMENT");
  } catch (err) {
    console.warn(`[rag] embedding failed for ${sourceType}:${sourceId} — keyword fallback only (${err.message})`);
  }

  const docs = await KnowledgeChunk.insertMany(
    chunks.map((c, i) => ({ sourceType, sourceId, slug, title: c.title, text: c.text, embedding: vectors[i] || [] }))
  );

  if (useQdrant() && vectors.length) {
    try {
      await ensureQdrantCollection();
      await qdrant(`/collections/${env.rag.qdrantCollection}/points/delete`, { filter: { must: [{ key: "sourceId", match: { value: sourceId } }] } });
      await qdrant(`/collections/${env.rag.qdrantCollection}/points?wait=true`, {
        points: docs.map((d, i) => ({ id: crypto.randomUUID(), vector: vectors[i], payload: { chunkId: String(d._id), sourceId } })),
      }, "PUT");
    } catch (err) {
      console.warn("[rag] qdrant upsert failed:", err.message);
    }
  }
  return docs.length;
};

export const indexPackage = async (pkg) => {
  if (!pkg) return 0;
  if (pkg.isActive === false) return removeSource("package", String(pkg._id));
  return indexSource("package", String(pkg._id), pkg.slug, packageChunks(pkg));
};
export const indexSettings = async (s) => (s ? indexSource("settings", "main", null, settingsChunks(s)) : 0);
export const indexBlog = async (b) => (b?.published === false ? removeSource("blog", String(b._id)) : indexSource("blog", String(b._id), b.slug, blogChunks(b)));
export const removeSource = async (sourceType, sourceId) => {
  await KnowledgeChunk.deleteMany({ sourceType, sourceId });
  if (useQdrant()) {
    qdrant(`/collections/${env.rag.qdrantCollection}/points/delete`, { filter: { must: [{ key: "sourceId", match: { value: sourceId } }] } }).catch(() => {});
  }
  return 0;
};

/** Run in background after admin edits — never blocks or fails the request. */
export const reindexInBackground = (fn) => {
  Promise.resolve().then(fn).catch((err) => console.warn("[rag] reindex failed:", err.message));
};

export const reindexAll = async () => {
  await KnowledgeChunk.deleteMany({});
  let n = 0;
  for (const p of await Package.find({ isActive: { $ne: false } })) n += await indexPackage(p);
  n += await indexSettings(await SiteSettings.findOne({ key: "main" }));
  for (const b of await Blog.find({ published: true })) n += await indexBlog(b);
  return n;
};

// ---------------- retrieval ----------------
const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
};

const STOP = new Set("a an the is are was what which who how when where do does i me my to for of in on at and or with from about can you your trek treks please tell".split(" "));
const tokens = (s) => (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter((t) => t.length > 2 && !STOP.has(t));

const keywordSearch = async (query) => {
  const qTokens = [...new Set(tokens(query))];
  if (!qTokens.length) return [];
  let docs = [];
  try {
    docs = await KnowledgeChunk.find({ $text: { $search: qTokens.join(" ") } }, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(env.rag.topK * 3)
      .lean();
  } catch {
    docs = [];
  }
  return docs
    .map((d) => {
      const hay = `${d.title} ${d.text}`.toLowerCase();
      const coverage = qTokens.filter((t) => hay.includes(t)).length / qTokens.length;
      return { ...d, score: coverage };
    })
    .filter((d) => d.score >= env.rag.keywordMinCoverage)
    .sort((a, b) => b.score - a.score)
    .slice(0, env.rag.topK);
};

/** Returns [{title, text, slug, score}] most relevant to the query. */
export const retrieve = async (query) => {
  try {
    const [qVec] = await embedTexts([query], "RETRIEVAL_QUERY");
    if (qVec?.length) {
      let scored;
      if (useQdrant()) {
        const res = await qdrant(`/collections/${env.rag.qdrantCollection}/points/search`, {
          vector: qVec,
          limit: env.rag.topK,
          score_threshold: env.rag.similarityThreshold,
          with_payload: true,
        });
        const ids = res.result.map((r) => r.payload.chunkId);
        const docs = await KnowledgeChunk.find({ _id: { $in: ids } }).lean();
        scored = res.result.map((r) => ({ ...docs.find((d) => String(d._id) === r.payload.chunkId), score: r.score })).filter((d) => d.text);
      } else {
        const docs = await KnowledgeChunk.find({ "embedding.0": { $exists: true } }).select("+embedding").lean();
        scored = docs
          .map((d) => ({ ...d, score: cosine(qVec, d.embedding) }))
          .filter((d) => d.score >= env.rag.similarityThreshold)
          .sort((a, b) => b.score - a.score)
          .slice(0, env.rag.topK);
      }
      if (scored.length) return scored.map(({ title, text, slug, score }) => ({ title, text, slug, score }));
    }
  } catch (err) {
    console.warn("[rag] vector retrieval failed, using keyword fallback:", err.message);
  }
  const kw = await keywordSearch(query);
  return kw.map(({ title, text, slug, score }) => ({ title, text, slug, score }));
};
