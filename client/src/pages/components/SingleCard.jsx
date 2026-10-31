import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaStar,
  FaBus,
  FaArrowRight
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
  const reviewsCount = packageData.packageTotalRatings || 140;
  const mumbaiPrice = packageData.mumbaiPrice || packageData.packagePrice || 1400;
  const punePrice = packageData.punePrice || packageData.packageDiscountPrice || 1300;
  const advance = packageData.advanceAmount || 500;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group relative flex flex-col bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300"
      >
        {/* Top Image & Overlays */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />

          {/* Top Left Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-white/95 backdrop-blur-sm text-emerald-800 shadow-sm border border-slate-100">
              {packageData.badge || packageData.difficulty || "Monsoon Trek"}
            </span>
          </div>

          {/* Top Right Rating Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold flex items-center gap-1 shadow-sm border border-slate-100">
            <FaStar className="text-amber-500" size={11} />
            <span>{rating}</span>
            <span className="text-slate-400 text-[10px]">({reviewsCount})</span>
          </div>

          {/* Departure Ticker Pill at Image Bottom */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <FaBus size={11} className="text-emerald-400" />
              {packageData.batchSchedule || "Every Weekend Departures"}
            </span>
            <span className="text-[11px] font-bold text-emerald-300 shrink-0">1D / 1N</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-4">
          <div>
            {/* Destination Location */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
              <FaMapMarkerAlt className="text-emerald-600 shrink-0" size={12} />
              <span className="truncate">
                {packageData.baseVillage ? `Base: ${packageData.baseVillage} • ` : ""}
                {packageData.packageDestination || "Maharashtra"}
              </span>
            </div>

            {/* Trek Title */}
            <Link
              to={`/package/${pkgId}`}
              className="text-slate-900 group-hover:text-emerald-700 transition"
            >
              <h3 className="text-lg font-bold leading-snug line-clamp-2">
                {packageData.packageName}
              </h3>
            </Link>

            {/* Trek Stats Pill tags */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {packageData.difficulty && (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  Grade: {packageData.difficulty}
                </span>
              )}
              {packageData.trailLength && (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  {packageData.trailLength}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                Unlimited Meals + AC Bus
              </span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Starting from</span>
                <div className="text-xl font-extrabold text-slate-900 flex items-baseline gap-1">
                  <span className="text-emerald-700">₹{punePrice}</span>
                  <span className="text-xs text-slate-500 font-normal">/person</span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-md">
                  Lock seat @ ₹{advance}/-
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Mumbai ₹{mumbaiPrice} | Pune ₹{punePrice}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to={`/package/${pkgId}`}
                className="py-2.5 px-3 rounded-xl text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition"
              >
                View Itinerary
              </Link>
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="py-2.5 px-3 rounded-xl text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-sm hover:shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
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
