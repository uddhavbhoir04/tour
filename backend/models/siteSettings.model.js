import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema({ time: String, location: String, landmark: String }, { _id: false });
const stepSchema = new mongoose.Schema({ title: String, description: String }, { _id: false });
const featureSchema = new mongoose.Schema({ title: String, description: String, icon: String }, { _id: false });
const categorySchema = new mongoose.Schema({ key: String, label: String }, { _id: false });

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    brandName: String,
    tagline: String,
    announcement: String,
    heroWords: [String],
    primaryPhone: String,
    callNumber1: String,
    callNumber2: String,
    contacts: [{ name: String, phone: String, _id: false }],
    whatsappNumber: String,
    email: String,
    instagram: String,
    upiId: String,
    upiHolderName: String,
    upiNumber: String,
    googleReviewsRating: String,
    reviewsCount: String,
    trekkersCount: String,
    priceRangeText: String,
    aboutTitle: String,
    aboutText: [String],
    whyChooseUs: [featureSchema],
    categories: [categorySchema],
    mumbaiPickups: [pickupSchema],
    punePickups: [pickupSchema],
    bookingSteps: [stepSchema],
    trustBadges: [{ _id: false, title: String, subtitle: String }],
  },
  { timestamps: true }
);

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
export default SiteSettings;
