import mongoose from "mongoose";
import Package from "../models/package.model.js";

const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Effective price field to filter/sort on for a departure city */
export const priceField = (city) => (city === "Pune" ? "punePrice" : city === "Mumbai" ? "mumbaiPrice" : "packageDiscountPrice");

/** Build a Mongo filter from public query params (shared by REST API and AI tools). */
export const buildPackageFilter = ({ searchTerm, region, difficulty, category, offer, minPrice, maxPrice, city, month } = {}) => {
  const filter = { isActive: { $ne: false } };
  const and = [];

  if (searchTerm) {
    const rx = { $regex: escapeRegex(searchTerm), $options: "i" };
    and.push({ $or: [{ packageName: rx }, { packageDestination: rx }, { region: rx }, { baseVillage: rx }, { tagline: rx }] });
  }
  if (region) filter.region = { $regex: escapeRegex(region), $options: "i" };
  if (difficulty) filter.difficulty = { $regex: escapeRegex(difficulty), $options: "i" };
  if (category && category !== "all") filter.categories = category;
  if (offer === true || offer === "true") filter.packageOffer = true;

  const field = priceField(city);
  const range = {};
  if (minPrice !== undefined && minPrice !== "" && !isNaN(minPrice)) range.$gte = Number(minPrice);
  if (maxPrice !== undefined && maxPrice !== "" && !isNaN(maxPrice)) range.$lte = Number(maxPrice);
  if (Object.keys(range).length) {
    // city price may be missing on older packages → fall back to discount price
    and.push({ $or: [{ [field]: range }, { [field]: { $exists: false }, packageDiscountPrice: range }] });
  }
  if (month) and.push({ bestTime: { $regex: escapeRegex(month.slice(0, 3)), $options: "i" } });

  if (and.length) filter.$and = and;
  return filter;
};

export const findPackageByIdOrSlug = (idOrSlug, { includeInactive = false } = {}) => {
  const base = includeInactive ? {} : { isActive: { $ne: false } };
  if (mongoose.isValidObjectId(idOrSlug)) return Package.findOne({ ...base, $or: [{ _id: idOrSlug }, { slug: idOrSlug }] });
  return Package.findOne({ ...base, slug: String(idOrSlug).toLowerCase() });
};
