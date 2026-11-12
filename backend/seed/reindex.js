import { env } from "../config/env.js";
import mongoose from "mongoose";
import { reindexAll } from "../services/ai/rag.js";

await mongoose.connect(env.mongoUrl);
console.log(`✓ indexed ${await reindexAll()} knowledge chunks`);
await mongoose.disconnect();
