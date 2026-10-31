import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaWhatsapp,
  FaCheckCircle,
  FaCopy,
  FaShieldAlt,
  FaBus,
  FaMapMarkerAlt,
  FaQrcode
} from "react-icons/fa";
import { ROAMING_BIRDS_CONTACTS } from "../../data/roamingBirdsData";

const BookingModal = ({ isOpen, onClose, trek }) => {
  if (!isOpen || !trek) return null;

  const [city, setCity] = useState("Mumbai");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pickupLocation:
      city === "Mumbai"
        ? trek.mumbaiPickups?.[0]?.location || ""
        : trek.punePickups?.[0]?.location || "",
    participants: 1,
    date: trek.batchSchedule || "Upcoming Weekend",
  });
  const [copiedUPI, setCopiedUPI] = useState(false);

  const pricePerPerson =
    city === "Mumbai"
      ? trek.mumbaiPrice || trek.packagePrice
      : trek.punePrice || trek.packageDiscountPrice || trek.packagePrice;
  const advancePerPerson = trek.advanceAmount || 500;
  const totalAdvance = advancePerPerson * formData.participants;
  const totalCost = pricePerPerson * formData.participants;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(ROAMING_BIRDS_CONTACTS.upiNumber);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleWhatsAppBooking = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please provide your Name and Contact Number");
      return;
    }

    const message = encodeURIComponent(
      `Hello The Roaming Birds! 🕊️\n\nI want to confirm my booking slot:\n` +
      `🧗 Trek: ${trek.packageName}\n` +
      `👤 Name: ${formData.name}\n` +
      `📞 Phone: ${formData.phone}\n` +
      `👥 Trekkers: ${formData.participants} Person(s)\n` +
      `🚌 Departure: ${city}\n` +
      `📍 Pickup: ${formData.pickupLocation}\n` +
      `💰 Advance Amount: ₹${totalAdvance}/- (via UPI: ${ROAMING_BIRDS_CONTACTS.upiNumber})\n\n` +
      `Please verify and confirm my slot. Thank you!`
    );

    window.open(
      `https://wa.me/${ROAMING_BIRDS_CONTACTS.whatsappNumber}?text=${message}`,
      "_blank"
    );
  };

  const currentPickups =
    city === "Mumbai" ? trek.mumbaiPickups : trek.punePickups;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 p-6 md:p-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <FaTimes size={18} />
          </button>

          {/* Header */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded-full mb-2">
              Slot Confirmation
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">
              {trek.packageName}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
              <FaBus className="text-emerald-600" />
              {trek.batchSchedule || "Upcoming Weekend Batches"}
            </p>
          </div>

          <form onSubmit={handleWhatsAppBooking} className="space-y-6">
            {/* City Selector */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Select Departure City
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCity("Mumbai");
                    setFormData({
                      ...formData,
                      pickupLocation: trek.mumbaiPickups?.[0]?.location || "",
                    });
                  }}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                    city === "Mumbai"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Mumbai (₹{trek.mumbaiPrice || trek.packagePrice}/-)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCity("Pune");
                    setFormData({
                      ...formData,
                      pickupLocation: trek.punePickups?.[0]?.location || "",
                    });
                  }}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                    city === "Pune"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Pune (₹{trek.punePrice || trek.packageDiscountPrice || trek.packagePrice}/-)
                </button>
              </div>
            </div>

            {/* Inputs: Name, Phone, Trekkers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  WhatsApp Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Point Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Pickup Point ({city})
                </label>
                <select
                  value={formData.pickupLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupLocation: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {currentPickups?.map((p, idx) => (
                    <option key={idx} value={p.location}>
                      {p.time} - {p.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of trekkers */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Number of Trekkers
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={formData.participants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      participants: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Advance Payment Details Box */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <FaQrcode /> Slot Confirmation Advance: ₹{totalAdvance}/-
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    (₹{advancePerPerson}/- per person to lock seat. Remaining ₹{totalCost - totalAdvance}/- pay on trek day)
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-600 text-white rounded-md">
                  Total: ₹{totalCost}/-
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-zinc-600 dark:text-zinc-400">UPI Number / GPay / PhonePe: </span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {ROAMING_BIRDS_CONTACTS.upiNumber} ({ROAMING_BIRDS_CONTACTS.upiHolderName})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="px-2.5 py-1 text-xs rounded bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 flex items-center gap-1 text-emerald-800 dark:text-emerald-200 transition"
                >
                  <FaCopy size={11} /> {copiedUPI ? "Copied!" : "Copy UPI"}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-base"
              >
                <FaWhatsapp size={20} />
                Send Booking Details on WhatsApp (+91 83298 15405)
              </button>
              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-2 flex items-center justify-center gap-1.5">
                <FaShieldAlt className="text-emerald-500" />
                Instant confirmation by Uddhav & Pratik • Added to WhatsApp batch group
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
