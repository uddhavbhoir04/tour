import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URL;
console.log("uri--->",uri)
    if (!uri) throw new Error("⚠️ MONGO_URL not defined");

    await mongoose.connect(uri);


    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ error to connect DB:", error.message);
    console.warn("⚠️ Tip: Verify your MongoDB Atlas cluster is active (not paused) and IP 0.0.0.0/0 is whitelisted.");
  }
};
