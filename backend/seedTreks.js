import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import Package from "./models/package.model.js";

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL;

const ROAMING_BIRDS_TREKS = [
  {
    packageName: "Aadrai Jungle Trek with Kalu Waterfall Viewpoint",
    packageDescription:
      "Aadrai Jungle Trek through dense rainforest canopy near Khireshwar Village. Features scenic river streams, bamboo thickets, and the iconic cliff viewpoint of Kalu Waterfall. Every Friday/Saturday night departures from Mumbai & Pune with unlimited local meals & AC travel.",
    packageDestination: "Malshej Ghat, Maharashtra",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "Local Base Homestay & AC Travel",
    packageTransportation: "AC Bus (Mumbai) / Non-AC (Pune)",
    packageMeals: "Unlimited Local Breakfast & Tasty Lunch (Veg / Non-Veg / Jain)",
    packageActivities: "Jungle Trekking, Waterfall Sightseeing, Photography, Team Bonding",
    packagePrice: 1400,
    packageDiscountPrice: 1300,
    packageOffer: true,
    packageRating: 4.9,
    packageTotalRatings: 184,
    packageImages: [
      "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    packageName: "Andharban Dark Forest Trek (Tamhini Ghat)",
    packageDescription:
      "UNESCO World Heritage Site monsoon gem. Andharban ('Dark Dense Forest' in Marathi) promises an immersive journey through dense misty forests, shadowy trails, cascading waterfalls, and Tamhini Ghat plateaus.",
    packageDestination: "Tamhini Ghat, Pune",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "Village Rest Area & Bus",
    packageTransportation: "AC Bus (Mumbai) / Non-AC (Pune)",
    packageMeals: "Unlimited Morning Tea, Breakfast & Maharashtrian Veg Lunch",
    packageActivities: "12km Forest Trekking, Plateau Walk, Mist Valley Exploration",
    packagePrice: 1500,
    packageDiscountPrice: 1400,
    packageOffer: true,
    packageRating: 5.0,
    packageTotalRatings: 240,
    packageImages: [
      "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    packageName: "Devkund Waterfall Secret Lagoon Trek",
    packageDescription:
      "A hidden paradise in the Western Ghats located inside Bhira forest near Patnus base village. Known as the 'Pond of the Gods', an azure blue water lagoon fed by three streams with surrounding rock cliffs.",
    packageDestination: "Patnus, Raigad, Maharashtra",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "Base Village Campsite",
    packageTransportation: "AC / Non-AC Private Bus",
    packageMeals: "Poha & Tea Breakfast, Unlimited Veg / Non-Veg Lunch at base",
    packageActivities: "River Crossing, Waterfall Dip & Chill, Photography",
    packagePrice: 1499,
    packageDiscountPrice: 1499,
    packageOffer: false,
    packageRating: 4.8,
    packageTotalRatings: 310,
    packageImages: [
      "https://images.unsplash.com/photo-1546587348-d12660c30c50?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    packageName: "Kalu Waterfall 5-Tier Giant Cascade Trek",
    packageDescription:
      "Witness the highest and most hidden gem of Malshej Ghat falling in five majestic tiers! Moderate level trek through thick forest canopy to panoramic cliff views.",
    packageDestination: "Malshej Ghat, Maharashtra",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "Homestay / Base Village",
    packageTransportation: "AC Private Bus from Mumbai & Pune",
    packageMeals: "Unlimited Veg Breakfast & Local Lunch",
    packageActivities: "Cliff Viewpoint Trek, Waterfall Photography, Forest Trail",
    packagePrice: 1399,
    packageDiscountPrice: 1299,
    packageOffer: true,
    packageRating: 4.9,
    packageTotalRatings: 165,
    packageImages: [
      "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546587348-d12660c30c50?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    packageName: "Nanemachi & Satsada Waterfall 400ft Drop Trek",
    packageDescription:
      "One of Maharashtra's most stunning hidden gems tucked away in the lush forests of Raigad district. With crystal blue waters and an impressive 400 ft sheer drop.",
    packageDestination: "Mahad, Raigad, Maharashtra",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "Base Village",
    packageTransportation: "AC Bus Pickup & Drop across Mumbai",
    packageMeals: "Unlimited Breakfast & Tea, Unlimited Veg Lunch",
    packageActivities: "Stream Trekking, Waterfall Photography, Nature Serenity",
    packagePrice: 1400,
    packageDiscountPrice: 1400,
    packageOffer: false,
    packageRating: 4.9,
    packageTotalRatings: 112,
    packageImages: [
      "https://images.unsplash.com/photo-1546587348-d12660c30c50?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1200&auto=format&fit=crop",
    ],
  },
];

async function seed() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not found in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    for (const trek of ROAMING_BIRDS_TREKS) {
      const existing = await Package.findOne({ packageName: trek.packageName });
      if (existing) {
        console.log(`Updating ${trek.packageName}`);
        await Package.updateOne({ _id: existing._id }, trek);
      } else {
        console.log(`Creating ${trek.packageName}`);
        await Package.create(trek);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
