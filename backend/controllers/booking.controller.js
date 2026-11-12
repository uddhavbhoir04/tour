import mongoose from "mongoose";
import Booking, { PAYMENT_STATUSES, BOOKING_STATUSES } from "../models/booking.model.js";
import Package from "../models/package.model.js";
import User from "../models/user.model.js";
import SiteSettings from "../models/siteSettings.model.js";
import { sendBookingCreated, sendBookingConfirmed } from "../services/email.js";

const ACTIVE_STATUSES = ["Pending", "Confirmed", "Booked"];
const today = () => new Date().toISOString().slice(0, 10);
const rx = (s = "") => ({ $regex: s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" });

const isAdminUser = async (userId) => (await User.findById(userId).select("user_role"))?.user_role === 1;

// ---------------- create ----------------
export const bookPackage = async (req, res, next) => {
  try {
    const packageId = req.params.packageId || req.body.packageDetails;
    const { persons, date, city = "Mumbai", pickupPoint, fullName, phone, email, notes } = req.body;

    const count = Number(persons);
    if (!packageId || !count || count < 1 || !date || !fullName || !phone) {
      return res.status(400).send({ success: false, message: "Name, phone, date and number of persons are required!" });
    }
    if (count > 20) return res.status(400).send({ success: false, message: "For groups over 20 please contact us directly." });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today()) {
      return res.status(400).send({ success: false, message: "Please pick a valid upcoming date." });
    }
    if (!["Mumbai", "Pune"].includes(city)) return res.status(400).send({ success: false, message: "City must be Mumbai or Pune" });
    if (!mongoose.isValidObjectId(packageId)) return res.status(404).send({ success: false, message: "Package Not Found!" });

    const pkg = await Package.findOne({ _id: packageId, isActive: { $ne: false } });
    if (!pkg) return res.status(404).send({ success: false, message: "Package Not Found!" });

    const user = await User.findById(req.user.id).select("email username");
    const pricePerPerson = pkg.priceFor(city);

    // price is always computed server-side
    const booking = await Booking.create({
      packageDetails: pkg._id,
      buyer: req.user.id,
      fullName,
      phone,
      email: email || user?.email,
      city,
      pickupPoint,
      persons: count,
      pricePerPerson,
      totalPrice: pricePerPerson * count,
      advanceAmount: (pkg.advanceAmount || 0) * count,
      date,
      notes,
    });

    const settings = await SiteSettings.findOne({ key: "main" }).lean();
    sendBookingCreated(booking, pkg, settings);

    return res.status(201).send({ success: true, message: "Booking created! Pay the advance to confirm your slot.", booking });
  } catch (error) {
    next(error);
  }
};

// ---------------- admin lists ----------------
const adminList = (filter) => async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const query = { ...filter() };
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
    const bookings = await Booking.find(query)
      .populate("packageDetails")
      .populate({ path: "buyer", select: "username email phone avatar", match: { $or: [{ username: rx(searchTerm) }, { email: rx(searchTerm) }] } })
      .sort({ date: 1, createdAt: 1 });
    const filtered = bookings.filter((b) => b.buyer !== null);
    return res.status(200).send({ success: true, bookings: filtered });
  } catch (error) {
    next(error);
  }
};

export const getCurrentBookings = adminList(() => ({ date: { $gte: today() }, status: { $in: ACTIVE_STATUSES } }));
export const getAllBookings = adminList(() => ({}));

// ---------------- user lists ----------------
const userList = (filter) => async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const bookings = await Booking.find({ buyer: req.user.id, ...filter() })
      .populate({ path: "packageDetails", match: { packageName: rx(searchTerm) } })
      .populate("buyer", "username email")
      .sort({ date: -1 });
    return res.status(200).send({ success: true, bookings: bookings.filter((b) => b.packageDetails !== null) });
  } catch (error) {
    next(error);
  }
};

// :id param kept for backwards compatibility; always scoped to the signed-in user
export const getUserCurrentBookings = userList(() => ({ date: { $gte: today() }, status: { $in: ACTIVE_STATUSES } }));
export const getAllUserBookings = userList(() => ({}));

// ---------------- mutations ----------------
const loadOwnedBooking = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).send({ success: false, message: "Booking not found" });
    return null;
  }
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404).send({ success: false, message: "Booking not found" });
    return null;
  }
  if (String(booking.buyer) !== req.user.id && !(await isAdminUser(req.user.id))) {
    res.status(401).send({ success: false, message: "You can only manage your own bookings!" });
    return null;
  }
  return booking;
};

export const deleteBookingHistory = async (req, res, next) => {
  try {
    const booking = await loadOwnedBooking(req, res);
    if (!booking) return;
    await booking.deleteOne();
    return res.status(200).send({ success: true, message: "Booking History Deleted!" });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await loadOwnedBooking(req, res);
    if (!booking) return;
    if (booking.status === "Cancelled") return res.status(400).send({ success: false, message: "Booking already cancelled" });
    booking.status = "Cancelled";
    await booking.save();
    return res.status(200).send({ success: true, message: "Booking Cancelled!", booking });
  } catch (error) {
    next(error);
  }
};

// user submits UPI transaction reference after paying
export const submitUpiRef = async (req, res, next) => {
  try {
    const booking = await loadOwnedBooking(req, res);
    if (!booking) return;
    const ref = String(req.body.upiTxnRef || "").trim();
    if (!/^[A-Za-z0-9-]{6,40}$/.test(ref)) return res.status(400).send({ success: false, message: "Enter a valid UPI transaction / UTR reference" });
    booking.upiTxnRef = ref;
    await booking.save();
    return res.status(200).send({ success: true, message: "Payment reference submitted. We'll verify and confirm shortly.", booking });
  } catch (error) {
    next(error);
  }
};

// admin: update payment / booking status
export const updateBookingPayment = async (req, res, next) => {
  try {
    const { paymentStatus, status } = req.body;
    if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) return res.status(400).send({ success: false, message: "Invalid payment status" });
    if (status && !BOOKING_STATUSES.includes(status)) return res.status(400).send({ success: false, message: "Invalid booking status" });

    const booking = await Booking.findById(req.params.id).populate("packageDetails");
    if (!booking) return res.status(404).send({ success: false, message: "Booking not found" });

    const wasConfirmed = booking.status === "Confirmed";
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (status) booking.status = status;
    // marking advance/full payment confirms a pending booking
    else if (["AdvancePaid", "Paid"].includes(paymentStatus) && ["Pending", "Booked"].includes(booking.status)) booking.status = "Confirmed";
    await booking.save();

    if (!wasConfirmed && booking.status === "Confirmed") sendBookingConfirmed(booking, booking.packageDetails);
    return res.status(200).send({ success: true, message: "Booking updated", booking });
  } catch (error) {
    next(error);
  }
};
