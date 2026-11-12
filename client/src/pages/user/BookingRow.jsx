import { useState } from "react";
import { Link } from "react-router-dom";
import { Rating } from "@mui/material";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../api/client";
import { packageImage } from "../../utils/imageUrl";
import { Badge } from "../admin/Payments";

const today = () => new Date().toLocaleDateString("en-CA");

const ReviewForm = ({ pkg, onDone }) => {
  const { currentUser } = useSelector((s) => s.user);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post("/api/rating/give-rating", {
        rating,
        review,
        packageId: pkg._id,
        userRef: currentUser._id,
        username: currentUser.username,
        userProfileImg: currentUser.avatar,
      });
      toast.success(data.message);
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
      <Rating value={rating} onChange={(_, v) => setRating(v || 1)} />
      <textarea rows={2} maxLength={1000} className="w-full border rounded-lg p-2 text-sm" placeholder="How was the trek?" value={review} onChange={(e) => setReview(e.target.value)} />
      <button disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 disabled:opacity-50">
        {saving ? "Posting…" : "Post review"}
      </button>
    </form>
  );
};

/** One booking for the signed-in user. mode: "current" | "history" */
const BookingRow = ({ booking, mode, onChanged }) => {
  const pkg = booking.packageDetails;
  const [upiRef, setUpiRef] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const isPast = booking.date < today();
  const canCancel = mode === "current" && ["Pending", "Confirmed", "Booked"].includes(booking.status);
  const canReview = mode === "history" && isPast && ["Confirmed", "Completed", "Booked"].includes(booking.status);

  const act = async (fn, success) => {
    setBusy(true);
    try {
      const { data } = await fn();
      toast.success(data.message || success);
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full p-3 rounded-xl border border-slate-200 bg-white flex flex-wrap gap-3 items-center">
      <Link to={`/package/${pkg?.slug || pkg?._id}`} className="shrink-0">
        {packageImage(pkg) ? <img className="w-16 h-16 rounded-lg object-cover" src={packageImage(pkg)} alt="" /> : <div className="w-16 h-16 rounded-lg bg-slate-100" />}
      </Link>
      <div className="flex-1 min-w-[200px] text-sm">
        <Link to={`/package/${pkg?.slug || pkg?._id}`} className="font-bold text-slate-900 hover:underline">
          {pkg?.packageName}
        </Link>
        <p className="text-xs text-slate-500">
          #{String(booking._id).slice(-8).toUpperCase()} • {booking.date} • {booking.city}
          {booking.pickupPoint ? ` (${booking.pickupPoint})` : ""} • {booking.persons} pax
        </p>
        <p className="text-xs text-slate-600">
          Total ₹{booking.totalPrice} • Advance ₹{booking.advanceAmount}
        </p>
        <div className="flex flex-wrap gap-1 mt-1 items-center">
          <Badge value={booking.status} />
          <Badge value={booking.paymentStatus} />
          {booking.upiTxnRef && <span className="text-[11px] font-mono text-slate-500">UPI ref {booking.upiTxnRef}</span>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {mode === "current" && booking.paymentStatus === "Pending" && !booking.upiTxnRef && booking.status !== "Cancelled" && (
          <div className="flex gap-1">
            <input value={upiRef} onChange={(e) => setUpiRef(e.target.value)} placeholder="UPI ref / UTR" className="border rounded-lg px-2 py-1 text-xs w-32" />
            <button
              disabled={busy || !upiRef.trim()}
              onClick={() => act(() => api.patch(`/api/booking/${booking._id}/upi-ref`, { upiTxnRef: upiRef.trim() }))}
              className="px-2 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        )}
        {canCancel && (
          <button
            disabled={busy}
            onClick={() => confirm("Cancel this booking?") && act(() => api.post(`/api/booking/cancel-booking/${booking._id}`))}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        {canReview && !reviewing && (
          <button onClick={() => setReviewing(true)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
            Write a review
          </button>
        )}
        {mode === "history" && (isPast || booking.status === "Cancelled") && (
          <button
            disabled={busy}
            onClick={() => confirm("Remove this booking from your history?") && act(() => api.delete(`/api/booking/delete-booking-history/${booking._id}`))}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
      {reviewing && pkg && <ReviewForm pkg={pkg} onDone={() => setReviewing(false)} />}
    </div>
  );
};

export default BookingRow;
