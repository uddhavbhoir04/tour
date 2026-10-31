import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaBus,
  FaWhatsapp,
  FaArrowRight,
  FaCheck
} from "react-icons/fa";
import BookingModal from "./BookingModal";

const SingleCard = ({ packageData }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);

  if (!packageData) return null;

  const pkgId = packageData._id || packageData.slug || "aadrai-jungle-trek";
  const displayImage =
    packageData.packageImages?.[0] ||
    "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=800&auto=format&fit=crop";

  const rating = packageData.packageRating || 4.9;
  const reviewsCount = packageData.packageTotalRatings || 120;
  const mumbaiPrice = packageData.mumbaiPrice || packageData.packagePrice || 1400;
  const punePrice = packageData.punePrice || packageData.packageDiscountPrice || 1300;
  const advance = packageData.advanceAmount || 500;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="group relative flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300"
      >
        {/* Top Image & Overlays */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-800">
          <Link
            to={`/package/${pkgId}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src={displayImage}
              alt={packageData.packageName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

          {/* Top Left Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-emerald-600/90 backdrop-blur-md text-white shadow">
              {packageData.badge || packageData.difficulty || "Monsoon Trek"}
            </span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-700/80 text-white text-xs font-semibold flex items-center gap-1 shadow">
            <FaStar className="text-yellow-400" size={11} />
            <span>{rating}</span>
            <span className="text-zinc-400 text-[10px]">({reviewsCount})</span>
          </div>

          {/* Departure Ticker Pill at Image Bottom */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-zinc-300 bg-zinc-950/70 backdrop-blur-md px-3 py-1 rounded-lg border border-zinc-800/80">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium truncate">
              <FaBus size={11} />
              {packageData.batchSchedule || "Every Weekend Departures"}
            </span>
            <span className="text-[11px] font-semibold text-zinc-300">1 Day / 1 Night</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-4">
          <div>
            {/* Destination */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-1.5">
              <FaMapMarkerAlt className="text-emerald-400" size={12} />
              <span className="truncate">
                {packageData.baseVillage ? `Base: ${packageData.baseVillage} • ` : ""}
                {packageData.packageDestination || "Maharashtra"}
              </span>
            </div>

            {/* Trek Title */}
            <Link
              to={`/package/${pkgId}`}
              className="text-white hover:text-emerald-400 transition"
            >
              <h3 className="text-lg font-bold leading-snug line-clamp-2">
                {packageData.packageName}
              </h3>
            </Link>

            {/* Trek Stats Pill tags */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {packageData.difficulty && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  Grade: {packageData.difficulty}
                </span>
              )}
              {packageData.trailLength && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  {packageData.trailLength}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                Meals + AC Travel Included
              </span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-zinc-400">Starting from</div>
                <div className="text-lg font-extrabold text-white flex items-baseline gap-1">
                  <span className="text-emerald-400">₹{punePrice}</span>
                  <span className="text-xs text-zinc-400 font-normal">/person</span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Lock slot @ ₹{advance}/-
                </span>
                <span className="block text-[10px] text-zinc-400 mt-0.5">
                  Mumbai ₹{mumbaiPrice} | Pune ₹{punePrice}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to={`/package/${pkgId}`}
                className="py-2.5 px-3 rounded-xl text-center text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition"
              >
                View Itinerary
              </Link>
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="py-2.5 px-3 rounded-xl text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-1.5"
              >
                <span>Book Slot</span>
                <FaArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        trek={packageData}
      />
    </>
  );
};

export default SingleCard;
