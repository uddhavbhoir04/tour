import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "model"], required: true },
    content: { type: String, required: true },
    suggestedTreks: [{ _id: false, slug: String, packageName: String, price: Number, image: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.ObjectId, ref: "User", index: true },
    guestId: { type: String, index: true },
    title: String,
    messages: [messageSchema],
  },
  { timestamps: true }
);

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
export default ChatSession;
