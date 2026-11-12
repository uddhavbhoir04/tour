import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUrl);
    console.log(`✅ MongoDB connected (${mongoose.connection.name})`);
  } catch (error) {
    console.error("❌ error to connect DB:", error.message);
    console.warn("⚠️ Tip: Verify your MongoDB Atlas cluster is active and your IP is whitelisted.");
    throw error;
  }
};
