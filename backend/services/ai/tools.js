import Package from "../../models/package.model.js";
import Booking from "../../models/booking.model.js";
import SiteSettings from "../../models/siteSettings.model.js";
import { buildPackageFilter, findPackageByIdOrSlug } from "../packageQuery.js";
import { retrieve } from "./rag.js";

const summary = (p) => ({
  slug: p.slug,
  name: p.packageName,
  link: `/package/${p.slug}`,
  destination: p.packageDestination,
  region: p.region,
  difficulty: p.difficulty,
  trailLength: p.trailLength,
  bestTime: p.bestTime,
  schedule: p.batchSchedule,
  mumbaiPrice: p.mumbaiPrice ?? p.packagePrice,
  punePrice: p.punePrice ?? p.packageDiscountPrice,
  advance: p.advanceAmount,
  rating: p.packageRating,
  badge: p.badge,
});

export const toSuggestion = (p) => ({
  slug: p.slug,
  packageName: p.packageName,
  price: p.punePrice && p.mumbaiPrice ? Math.min(p.punePrice, p.mumbaiPrice) : p.packageDiscountPrice || p.packagePrice,
  image: p.packageImages?.[0],
});

export const TOOL_DECLARATIONS = [
  {
    name: "searchTreks",
    description: "Search the live trek catalog. Use for recommendations or any question about which treks exist, prices, difficulty, region or month. Returns at most 6 treks.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text keywords such as 'waterfall', 'Malshej', 'jungle'" },
        region: { type: "string" },
        difficulty: { type: "string", description: "e.g. Easy, Moderate" },
        maxPrice: { type: "number", description: "Maximum price per person in INR" },
        city: { type: "string", enum: ["Mumbai", "Pune"], description: "Departure city, affects price" },
        month: { type: "string", description: "Month name, e.g. July" },
      },
    },
  },
  {
    name: "getTrekDetails",
    description: "Get full details of one trek: itinerary, pickup points, inclusions/exclusions, what to carry, rules, prices.",
    parametersJsonSchema: {
      type: "object",
      properties: { slugOrName: { type: "string", description: "Trek slug (e.g. 'devkund-waterfall-trek') or name" } },
      required: ["slugOrName"],
    },
  },
  {
    name: "searchKnowledge",
    description: "Semantic search over trek pages, site info and blog articles. Use for open questions (safety, packing, food, pickups) when you don't know the exact trek.",
    parametersJsonSchema: {
      type: "object",
      properties: { question: { type: "string" } },
      required: ["question"],
    },
  },
  {
    name: "getSiteInfo",
    description: "Contact numbers, WhatsApp, UPI payment details and the booking process.",
    parametersJsonSchema: { type: "object", properties: {} },
  },
];

export const MY_BOOKINGS_DECLARATION = {
  name: "getMyBookings",
  description: "List the signed-in user's own bookings (upcoming and past) with status and payment status.",
  parametersJsonSchema: {
    type: "object",
    properties: { upcomingOnly: { type: "boolean" } },
  },
};

/** Execute a tool call. `ctx.suggestions` collects treks to show as cards. */
export const runTool = async (name, args = {}, ctx) => {
  switch (name) {
    case "searchTreks": {
      const filter = buildPackageFilter({
        searchTerm: args.query,
        region: args.region,
        difficulty: args.difficulty,
        maxPrice: args.maxPrice,
        city: args.city,
        month: args.month,
      });
      let treks = await Package.find(filter).sort({ packageRating: -1 }).limit(6).lean();
      // a strict keyword combo returned nothing → retry with just the structured filters
      if (!treks.length && args.query) {
        treks = await Package.find(buildPackageFilter({ ...args, query: undefined, searchTerm: undefined })).sort({ packageRating: -1 }).limit(6).lean();
      }
      treks.forEach((t) => ctx.suggestions.set(t.slug, toSuggestion(t)));
      return { count: treks.length, treks: treks.map(summary) };
    }
    case "getTrekDetails": {
      const key = String(args.slugOrName || "");
      let p = await findPackageByIdOrSlug(key).lean();
      if (!p) {
        const rx = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").split(/\s+/).join(".*"), "i");
        p = await Package.findOne({ isActive: { $ne: false }, packageName: rx }).lean();
      }
      if (!p) return { error: `No trek found for "${key}". Use searchTreks to list available treks.` };
      ctx.suggestions.set(p.slug, toSuggestion(p));
      return {
        ...summary(p),
        description: p.packageDescription,
        baseVillage: p.baseVillage,
        trailType: p.trailType,
        endurance: p.endurance,
        duration: p.duration,
        days: p.packageDays,
        nights: p.packageNights,
        meals: p.packageMeals,
        transport: p.packageTransportation,
        itinerary: p.itinerary,
        mumbaiPickups: p.mumbaiPickups,
        punePickups: p.punePickups,
        inclusions: p.inclusions,
        exclusions: p.exclusions,
        whatToCarry: p.whatToCarry,
        importantRules: p.importantRules,
      };
    }
    case "searchKnowledge": {
      const hits = await retrieve(String(args.question || ""));
      return { results: hits.map((h) => ({ source: h.title, link: h.slug ? `/package/${h.slug}` : undefined, text: h.text })) };
    }
    case "getSiteInfo": {
      const s = await SiteSettings.findOne({ key: "main" }).lean();
      if (!s) return { error: "Site info not configured" };
      return {
        brand: s.brandName,
        phone: s.primaryPhone,
        contacts: s.contacts,
        whatsapp: s.whatsappNumber ? `https://wa.me/${s.whatsappNumber}` : undefined,
        instagram: s.instagram,
        upi: { number: s.upiNumber, id: s.upiId, name: s.upiHolderName },
        bookingSteps: s.bookingSteps,
        schedule: s.announcement,
      };
    }
    case "getMyBookings": {
      if (!ctx.userId) return { error: "User is not signed in. Ask them to log in to see their bookings." };
      const filter = { buyer: ctx.userId };
      if (args.upcomingOnly) filter.date = { $gte: new Date().toISOString().slice(0, 10) };
      const bookings = await Booking.find(filter).populate("packageDetails", "packageName slug").sort({ date: -1 }).limit(10).lean();
      return {
        count: bookings.length,
        bookings: bookings.map((b) => ({
          bookingId: String(b._id).slice(-8).toUpperCase(),
          trek: b.packageDetails?.packageName,
          link: b.packageDetails?.slug ? `/package/${b.packageDetails.slug}` : undefined,
          date: b.date,
          city: b.city,
          pickup: b.pickupPoint,
          persons: b.persons,
          total: b.totalPrice,
          advance: b.advanceAmount,
          status: b.status,
          paymentStatus: b.paymentStatus,
        })),
      };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
};
