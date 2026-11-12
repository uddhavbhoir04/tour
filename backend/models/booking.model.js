import mongoose from "mongoose";

export const BOOKING_STATUSES = ["Pending", "Confirmed", "Cancelled", "Completed"];
export const PAYMENT_STATUSES = ["Pending", "AdvancePaid", "Paid", "Refunded"];

const bookingSchema = new mongoose.Schema(
  {
    packageDetails: { type: mongoose.ObjectId, ref: "Package", required: true },
    buyer: { type: mongoose.ObjectId, ref: "User", required: true },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    city: { type: String, enum: ["Mumbai", "Pune"], default: "Mumbai" },
    pickupPoint: String,
    persons: { type: Number, required: true, min: 1 },
    pricePerPerson: Number,
    totalPrice: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 },
    // trek batch date, YYYY-MM-DD
    date: { type: String, required: true },
    notes: String,
    paymentMethod: { type: String, default: "UPI" },
    upiTxnRef: String,
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "Pending" },
    // "Booked" kept for legacy records
    status: { type: String, enum: [...BOOKING_STATUSES, "Booked"], default: "Pending" },
    reminderSentAt: Date,
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
