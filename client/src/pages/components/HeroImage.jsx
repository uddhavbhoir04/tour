import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCompass,
  FaStar,
  FaShieldAlt,
  FaUsers,
  FaWhatsapp,
  FaArrowRight
} from "react-icons/fa";
import { ROAMING_BIRDS_CONTACTS } from "../../data/roamingBirdsData";

const DYNAMIC_WORDS = ["Routine", "Noise", "Concrete Jungle", "Stress", "Ordinary"];

const HeroImage = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCity, setSelectedCity] = useState("Mumbai");

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % DYNAMIC_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?searchTerm=${encodeURIComponent(searchLocation)}`);
  };

  return (
    <div className="relative w-full -mt-20 pt-28 pb-16 md:pb-24 overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Background Ambient Glow & Imagery */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=2000&auto=format&fit=crop"
          alt="Sahyadri Misty Rainforest"
          className="w-full h-full object-cover opacity-25 scale-105 transform motion-safe:animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md shadow-lg shadow-emerald-950/50"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            🧗🏻 The Roaming Birds Presents • Monsoon 2026 Season
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-tight"
          >
            Wander Far, Discover More.
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-3">
              <span>Break The</span>
              <div className="inline-block relative min-w-[180px] sm:min-w-[280px] text-emerald-400 underline decoration-emerald-500/60 decoration-wavy">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -25 }}
                    transition={{ duration: 0.35 }}
                    className="inline-block"
                  >
                    {DYNAMIC_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl leading-relaxed"
          >
            Explore misty rainforest trails, roaring waterfall canyons, and hidden Sahyadri gems with certified guides. 
            <span className="text-emerald-400 font-semibold"> Every Friday & Saturday night departure</span> from Mumbai & Pune.
          </motion.p>

          {/* Interactive Search / Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-4xl mt-10 p-2 sm:p-3 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              {/* Destination Input */}
              <div className="sm:col-span-5 flex items-center gap-3 px-4 py-3 bg-zinc-800/80 rounded-xl border border-zinc-700/60">
                <FaMapMarkerAlt className="text-emerald-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Where to? (e.g. Aadrai, Andharban, Devkund)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>

              {/* City Filter */}
              <div className="sm:col-span-4 flex items-center gap-3 px-4 py-3 bg-zinc-800/80 rounded-xl border border-zinc-700/60">
                <FaCompass className="text-emerald-400 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="Mumbai" className="bg-zinc-900 text-white">
                    Departure: Mumbai Pickups
                  </option>
                  <option value="Pune" className="bg-zinc-900 text-white">
                    Departure: Pune Pickups
                  </option>
                </select>
              </div>

              {/* Search Button */}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <FaSearch />
                  <span>Find Treks</span>
                </button>
              </div>
            </form>
          </motion.div>

          {/* Social Proof & Trust Badges Strip (Inspired by Trekkaro) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-zinc-300"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-emerald-500/10 text-yellow-400">
                <FaStar />
              </div>
              <div>
                <span className="font-extrabold text-white text-base">4.9/5</span>
                <span className="text-zinc-400 block text-[11px]">950+ Google Reviews</span>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-zinc-800" />

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                <FaUsers />
              </div>
              <div>
                <span className="font-extrabold text-white text-base">12,000+</span>
                <span className="text-zinc-400 block text-[11px]">Happy Trekkers</span>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-zinc-800" />

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                <FaShieldAlt />
              </div>
              <div>
                <span className="font-extrabold text-white text-base">100% Verified</span>
                <span className="text-zinc-400 block text-[11px]">Safe for Female & Solo Travelers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroImage;
