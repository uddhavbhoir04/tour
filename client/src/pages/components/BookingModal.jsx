import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes, FaWhatsapp, FaCopy, FaShieldAlt, FaBus, FaQrcode, FaCheckCircle } from "react-icons/fa";
import api from "../../api/client";
import { useSettings } from "../../context/SettingsContext";

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
};

const BookingModal = ({ isOpen, onClose, trek }) => {
  const { currentUser } = useSelector((state) => state.user);
  const { s } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [city, setCity] = useState("Mumbai");
  const [form, setForm] = useState({ fullName: "", phone: "", pickupPoint: "", persons: 1, date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const [upiRef, setUpiRef] = useState("");
  const [refStatus, setRefStatus] = useState({ loading: false, message: "", ok: false });
  const [copiedUPI, setCopiedUPI] = useState(false);

  const pickupsFor = (c) => {
    const own = c === "Mumbai" ? trek?.mumbaiPickups : trek?.punePickups;
    return own?.length ? own : (c === "Mumbai" ? s.mumbaiPickups : s.punePickups) || [];
  };
  const currentPickups = pickupsFor(city);

  // reset each time the modal opens
  useEffect(() => {
    if (!isOpen || !trek) return;
    setCity("Mumbai");
    setForm({
      fullName: currentUser?.username || "",
      phone: currentUser?.phone || "",
      pickupPoint: pickupsFor("Mumbai")[0]?.location || "",
      persons: 1,
      date: "",
    });
    setBooking(null);
    setError("");
    setUpiRef("");
    setRefStatus({ loading: false, message: "", ok: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, trek?._id]);

  if (!isOpen || !trek) return null;

  const basePrice = trek.packageOffer ? trek.packageDiscountPrice : trek.packagePrice;
  const priceFor = (c) => (c === "Pune" ? trek.punePrice : trek.mumbaiPrice) || basePrice;
  const pricePerPerson = priceFor(city);
  const advancePerPerson = trek.advanceAmount || 0;
  const totalCost = pricePerPerson * form.persons;
  const totalAdvance = advancePerPerson * form.persons;

  const switchCity = (c) => {
    setCity(c);
    setForm((f) => ({ ...f, pickupPoint: pickupsFor(c)[0]?.location || "" }));
  };

  const copyUPI = () => {
    navigator.clipboard?.writeText(s.upiNumber || "");
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const goToLogin = () => {
    onClose();
    navigate("/login", { state: { from: location.pathname } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!currentUser) return goToLogin();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/booking/book-package/${trek._id}`, { ...form, city });
      setBooking(data.booking);
    } catch (err) {
      if (err.status === 401 || err.status === 403) return goToLogin();
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitUpiRef = async () => {
    setRefStatus({ loading: true, message: "", ok: false });
    try {
      const { data } = await api.patch(`/api/booking/${booking._id}/upi-ref`, { upiTxnRef: upiRef.trim() });
      setBooking(data.booking);
      setRefStatus({ loading: false, message: data.message, ok: true });
    } catch (err) {
      setRefStatus({ loading: false, message: err.message, ok: false });
    }
  };

  const bookingCode = booking ? String(booking._id).slice(-8).toUpperCase() : "";
  const whatsappLink = booking
    ? `https://wa.me/${s.whatsappNumber}?text=${encodeURIComponent(
        `Hello ${s.brandName}! 🕊️\n\nBooking ID: ${bookingCode}\n🧗 Trek: ${trek.packageName}\n📅 Date: ${booking.date}\n👤 Name: ${booking.fullName}\n👥 Trekkers: ${booking.persons}\n🚌 ${booking.city} — ${booking.pickupPoint || ""}\n💰 Advance: ₹${booking.advanceAmount}${booking.upiTxnRef ? `\n🧾 UPI Ref: ${booking.upiTxnRef}` : ""}\n\nSharing my payment screenshot. Please confirm my slot!`
      )}`
    : "";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-6 md:p-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <FaTimes size={18} />
          </button>

          <div className="border-b border-slate-100 pb-4 mb-6">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 rounded-full mb-2">
              {booking ? "Booking Created" : "Book Your Slot"}
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">{trek.packageName}</h3>
            {trek.batchSchedule && (
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <FaBus className="text-emerald-600" />
                {trek.batchSchedule}
              </p>
            )}
          </div>

          {booking ? (
            /* ---------- Step 2: pay advance ---------- */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <FaCheckCircle className="text-emerald-600 mt-0.5 shrink-0" size={20} />
                <div className="text-sm">
                  <p className="font-bold text-emerald-900">
                    Booking ID {bookingCode} • {booking.status}
                  </p>
                  <p className="text-emerald-800 mt-0.5">
                    {booking.persons} trekker(s) • {booking.date} • {booking.city}
                    {booking.pickupPoint ? ` — ${booking.pickupPoint}` : ""}
                  </p>
                  <p className="text-emerald-800 mt-0.5">
                    Total ₹{booking.totalPrice} • Advance to pay now: <b>₹{booking.advanceAmount}</b>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm space-y-3">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FaQrcode /> Pay ₹{booking.advanceAmount} via any UPI app
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-bold text-slate-900">
                    {s.upiNumber} {s.upiId ? `/ ${s.upiId}` : ""} ({s.upiHolderName})
                  </span>
                  <button
                    type="button"
                    onClick={copyUPI}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-white border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1 text-emerald-800 transition"
                  >
                    <FaCopy size={11} /> {copiedUPI ? "Copied!" : "Copy UPI"}
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UPI transaction / UTR reference</label>
                  <div className="flex gap-2">
                    <input
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                      placeholder="e.g. 412345678901"
                      className={inputCls}
                      disabled={Boolean(booking.upiTxnRef)}
                    />
                    <button
                      type="button"
                      onClick={submitUpiRef}
                      disabled={refStatus.loading || !upiRef.trim() || Boolean(booking.upiTxnRef)}
                      className="px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {refStatus.loading ? "Saving..." : booking.upiTxnRef ? "Submitted" : "Submit"}
                    </button>
                  </div>
                  {refStatus.message && (
                    <p className={`text-xs mt-1 ${refStatus.ok ? "text-emerald-700" : "text-red-600"}`}>{refStatus.message}</p>
                  )}
                </div>
              </div>

              {s.whatsappNumber && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20ba5a] transition flex items-center justify-center gap-2"
                >
                  <FaWhatsapp size={20} /> Send payment screenshot on WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/profile/user");
                }}
                className="w-full py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                View my bookings
              </button>
            </div>
          ) : (
            /* ---------- Step 1: details ---------- */
            <form onSubmit={handleSubmit} className="space-y-6">
              {!currentUser && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                  <span>Please log in to book — your booking will be saved to your account.</span>
                  <button type="button" onClick={goToLogin} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold shrink-0">
                    Log in
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Departure City</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Mumbai", "Pune"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => switchCity(c)}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition ${
                        city === c
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${c === "Mumbai" ? "bg-emerald-600" : "bg-blue-600"}`}></span>
                      {c} (₹{priceFor(c)}/-)
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Contact Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9+\s-]{10,15}"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trek Date *</label>
                  <input
                    type="date"
                    required
                    min={tomorrow()}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Point ({city})</label>
                  <select
                    value={form.pickupPoint}
                    onChange={(e) => setForm({ ...form, pickupPoint: e.target.value })}
                    className={inputCls}
                  >
                    {currentPickups.map((p) => (
                      <option key={`${p.time}-${p.location}`} value={p.location}>
                        {p.time} - {p.location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Number of Trekkers</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={form.persons}
                    onChange={(e) => setForm({ ...form, persons: Math.min(20, Math.max(1, parseInt(e.target.value) || 1)) })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                      <FaQrcode /> Advance to lock slot: ₹{totalAdvance}/-
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      (₹{advancePerPerson}/- per person. Remaining ₹{totalCost - totalAdvance}/- on trek day)
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-600 text-white rounded-md shrink-0">Total: ₹{totalCost}/-</span>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 active:scale-[0.99] transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 text-base"
                >
                  {submitting ? "Creating booking..." : currentUser ? "Confirm Booking" : "Log in to Book"}
                </button>
                <p className="text-center text-xs text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                  <FaShieldAlt className="text-emerald-600" />
                  Your slot is confirmed once the advance is verified
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
