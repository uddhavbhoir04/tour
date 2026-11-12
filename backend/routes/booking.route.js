import express from "express";
import {
  bookPackage,
  cancelBooking,
  deleteBookingHistory,
  getAllBookings,
  getAllUserBookings,
  getCurrentBookings,
  getUserCurrentBookings,
  submitUpiRef,
  updateBookingPayment,
} from "../controllers/booking.controller.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/book-package/:packageId", requireSignIn, bookPackage);

// admin
router.get("/get-currentBookings", requireSignIn, isAdmin, getCurrentBookings);
router.get("/get-allBookings", requireSignIn, isAdmin, getAllBookings);
router.patch("/:id/payment", requireSignIn, isAdmin, updateBookingPayment);

// user (":id" segments are ignored — always the signed-in user)
router.get("/get-UserCurrentBookings/:id?", requireSignIn, getUserCurrentBookings);
router.get("/get-allUserBookings/:id?", requireSignIn, getAllUserBookings);
router.patch("/:id/upi-ref", requireSignIn, submitUpiRef);
router.delete("/delete-booking-history/:id/:userId?", requireSignIn, deleteBookingHistory);
router.post("/cancel-booking/:id/:userId?", requireSignIn, cancelBooking);

export default router;
