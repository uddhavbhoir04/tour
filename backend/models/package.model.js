import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema(
  { time: { type: String, trim: true }, location: { type: String, trim: true } },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  { day: String, title: String, items: [String] },
  { _id: false }
);

export const DIFFICULTIES = ["Easy", "Easy to Moderate", "Normal to Moderate", "Moderate", "Moderate to Difficult", "Difficult"];

export const slugify = (s = "") =>
  s.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const packageSchema = new mongoose.Schema(
  {
    packageName: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    badge: String,
    tagline: String,
    categories: { type: [String], index: true, default: [] },
    packageDescription: { type: String, required: true },
    packageDestination: { type: String, required: true },
    baseVillage: String,
    region: { type: String, index: true },
    packageDays: { type: Number, required: true },
    packageNights: { type: Number, required: true },
    trailType: String,
    difficulty: { type: String, index: true },
    endurance: String,
    trailLength: String,
    duration: String,
    bestTime: String,
    batchSchedule: String,
    packageAccommodation: { type: String, required: true },
    packageTransportation: { type: String, required: true },
    packageMeals: { type: String, required: true },
    packageActivities: { type: String, required: true },
    packagePrice: { type: Number, required: true },
    packageDiscountPrice: { type: Number, required: true },
    mumbaiPrice: Number,
    punePrice: Number,
    advanceAmount: { type: Number, default: 500 },
    packageOffer: { type: Boolean, required: true },
    packageRating: { type: Number, default: 0 },
    packageTotalRatings: { type: Number, default: 0 },
    packageImages: { type: [String], default: [] },
    inclusions: [String],
    exclusions: [String],
    whatToCarry: [String],
    importantRules: [String],
    mumbaiPickups: [pickupSchema],
    punePickups: [pickupSchema],
    itinerary: [itinerarySchema],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

packageSchema.index({
  packageName: "text",
  packageDestination: "text",
  region: "text",
  packageDescription: "text",
  tagline: "text",
});

packageSchema.pre("validate", function (next) {
  if (!this.slug && this.packageName) this.slug = slugify(this.packageName);
  next();
});

// Price for a given departure city (falls back to discount/regular price)
packageSchema.methods.priceFor = function (city) {
  if (city === "Pune" && this.punePrice) return this.punePrice;
  if (city === "Mumbai" && this.mumbaiPrice) return this.mumbaiPrice;
  return this.packageOffer ? this.packageDiscountPrice : this.packagePrice;
};

const Package = mongoose.model("Package", packageSchema);
export default Package;
