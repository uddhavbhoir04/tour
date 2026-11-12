import Package, { slugify } from "../models/package.model.js";
import { buildPackageFilter, findPackageByIdOrSlug, priceField } from "../services/packageQuery.js";
import { cacheGet, cacheSet, cacheDelPrefix } from "../services/redis.js";
import { indexPackage, removeSource, reindexInBackground } from "../services/ai/rag.js";

const ARRAY_FIELDS = ["inclusions", "exclusions", "whatToCarry", "importantRules", "mumbaiPickups", "punePickups", "itinerary", "categories", "packageImages"];
const NUMBER_FIELDS = ["packageDays", "packageNights", "packagePrice", "packageDiscountPrice", "mumbaiPrice", "punePrice", "advanceAmount"];
const STRING_FIELDS = [
  "packageName", "slug", "badge", "tagline", "packageDescription", "packageDestination", "baseVillage", "region",
  "trailType", "difficulty", "endurance", "trailLength", "duration", "bestTime", "batchSchedule",
  "packageAccommodation", "packageTransportation", "packageMeals", "packageActivities",
];

/** Normalise a (possibly multipart) body: arrays arrive as JSON strings, numbers/booleans as strings. */
const parseBody = (body = {}) => {
  const out = {};
  for (const f of STRING_FIELDS) if (body[f] !== undefined) out[f] = String(body[f]).trim();
  for (const f of NUMBER_FIELDS) if (body[f] !== undefined && body[f] !== "") out[f] = Number(body[f]);
  for (const f of ARRAY_FIELDS) {
    if (body[f] === undefined) continue;
    let v = body[f];
    if (typeof v === "string") {
      try {
        v = JSON.parse(v);
      } catch {
        v = v.split("\n").map((s) => s.trim()).filter(Boolean);
      }
    }
    out[f] = Array.isArray(v) ? v : [v];
  }
  if (body.packageOffer !== undefined) out.packageOffer = body.packageOffer === true || body.packageOffer === "true";
  if (body.isActive !== undefined) out.isActive = body.isActive === true || body.isActive === "true";
  if (out.slug) out.slug = slugify(out.slug);
  return out;
};

const validate = (d, { partial = false } = {}) => {
  const required = ["packageName", "packageDescription", "packageDestination", "packageAccommodation", "packageTransportation", "packageMeals", "packageActivities", "packagePrice", "packageDiscountPrice"];
  if (!partial) {
    const missing = required.filter((f) => d[f] === undefined || d[f] === "");
    if (missing.length) return `Missing fields: ${missing.join(", ")}`;
  }
  if (d.packagePrice !== undefined && d.packagePrice <= 0) return "Price should be greater than 0!";
  if (d.packagePrice !== undefined && d.packageDiscountPrice !== undefined && d.packagePrice < d.packageDiscountPrice)
    return "Regular price should be greater than discount price!";
  if (!partial && !(d.packageDays > 0) && !(d.packageNights > 0)) return "Provide days and nights!";
  return null;
};

const invalidate = () => cacheDelPrefix("pkg:");

export const createPackage = async (req, res, next) => {
  try {
    const data = parseBody(req.body);
    const uploaded = (req.files || []).map((f) => f.filename);
    data.packageImages = [...(data.packageImages || []), ...uploaded];
    data.packageDays ??= 0;
    data.packageNights ??= 0;
    data.packageOffer ??= false;

    const error = validate(data);
    if (error) return res.status(400).send({ success: false, message: error });

    data.slug = data.slug || slugify(data.packageName);
    if (await Package.exists({ slug: data.slug })) data.slug = `${data.slug}-${Date.now().toString(36)}`;

    const newPackage = await Package.create(data);
    await invalidate();
    reindexInBackground(() => indexPackage(newPackage));
    return res.status(201).send({ success: true, message: `${data.packageName} created successfully`, package: newPackage });
  } catch (error) {
    next(error);
  }
};

export const getPackages = async (req, res, next) => {
  try {
    const adminView = req.isAdmin && req.query.admin === "1";
    const cacheKey = `pkg:list:${adminView ? "admin:" : ""}${JSON.stringify(req.query)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).send(cached);

    const limit = Math.min(parseInt(req.query.limit) || 9, 100);
    const startIndex = parseInt(req.query.startIndex) || 0;
    const allowedSort = ["createdAt", "packageRating", "packageTotalRatings", "packageDiscountPrice", "packagePrice", "mumbaiPrice", "punePrice", "packageName"];
    const sort = req.query.sort === "price" ? priceField(req.query.city) : allowedSort.includes(req.query.sort) ? req.query.sort : "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const filter = buildPackageFilter(req.query);
    if (adminView) delete filter.isActive;
    const [packages, total] = await Promise.all([
      Package.find(filter).sort({ [sort]: order, _id: 1 }).skip(startIndex).limit(limit).lean(),
      Package.countDocuments(filter),
    ]);
    const payload = { success: true, packages, total };
    await cacheSet(cacheKey, payload);
    return res.status(200).send(payload);
  } catch (error) {
    next(error);
  }
};

// distinct values for the Search page filter controls
export const getPackageFilters = async (req, res, next) => {
  try {
    const cached = await cacheGet("pkg:filters");
    if (cached) return res.status(200).send(cached);
    const active = { isActive: { $ne: false } };
    const [regions, difficulties, categories, [range]] = await Promise.all([
      Package.distinct("region", active),
      Package.distinct("difficulty", active),
      Package.distinct("categories", active),
      Package.aggregate([
        { $match: active },
        { $project: { prices: { $filter: { input: ["$mumbaiPrice", "$punePrice", "$packageDiscountPrice"], cond: { $gt: ["$$this", 0] } } } } },
        { $unwind: "$prices" },
        { $group: { _id: null, min: { $min: "$prices" }, max: { $max: "$prices" } } },
      ]),
    ]);
    const payload = {
      success: true,
      regions: regions.filter(Boolean).sort(),
      difficulties: difficulties.filter(Boolean).sort(),
      categories: categories.filter(Boolean),
      minPrice: range?.min ?? 0,
      maxPrice: range?.max ?? 0,
    };
    await cacheSet("pkg:filters", payload);
    return res.status(200).send(payload);
  } catch (error) {
    next(error);
  }
};

export const getPackageData = async (req, res, next) => {
  try {
    const packageData = await findPackageByIdOrSlug(req.params.id, { includeInactive: Boolean(req.isAdmin) && req.query.admin === "1" });
    if (!packageData) return res.status(404).send({ success: false, message: "Package not found!" });
    return res.status(200).send({ success: true, packageData });
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).send({ success: false, message: "Package not found" });

    const data = parseBody(req.body);
    const error = validate({ ...pkg.toObject(), ...data }, { partial: true });
    if (error) return res.status(400).send({ success: false, message: error });

    // new uploads are appended to the kept images (client sends the kept list as packageImages)
    const uploaded = (req.files || []).map((f) => f.filename);
    if (uploaded.length || data.packageImages) data.packageImages = [...(data.packageImages ?? pkg.packageImages), ...uploaded];

    if (data.slug && data.slug !== pkg.slug && (await Package.exists({ slug: data.slug, _id: { $ne: pkg._id } }))) {
      return res.status(400).send({ success: false, message: "Slug already in use" });
    }

    pkg.set(data);
    await pkg.save();
    await invalidate();
    reindexInBackground(() => indexPackage(pkg));
    return res.status(200).send({ success: true, message: "Package updated successfully", package: pkg });
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send({ success: false, message: "Package not found" });
    await invalidate();
    reindexInBackground(() => removeSource("package", String(deleted._id)));
    return res.status(200).send({ success: true, message: "Package Deleted!" });
  } catch (error) {
    next(error);
  }
};
