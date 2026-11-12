import mongoose from "mongoose";

const knowledgeChunkSchema = new mongoose.Schema(
  {
    sourceType: { type: String, enum: ["package", "settings", "blog"], required: true },
    sourceId: { type: String, required: true, index: true },
    slug: String,
    title: String,
    text: { type: String, required: true },
    embedding: { type: [Number], select: false },
  },
  { timestamps: true }
);

knowledgeChunkSchema.index({ text: "text", title: "text" });

const KnowledgeChunk = mongoose.model("KnowledgeChunk", knowledgeChunkSchema);
export default KnowledgeChunk;
