import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCompass,
  FaStar,
  FaShieldAlt,
  FaUsers,
  FaMountain
} from "react-icons/fa";

const DYNAMIC_WORDS = ["Routine", "Noise", "Concrete Jungle", "Stress", "Ordinary"];

const HeroImage = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCity, setSelectedCity] = useState("Mumbai");

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % DYNAMIC_WORDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?searchTerm=${encodeURIComponent(searchLocation)}`);
  };

  return (
    <div className="relative w-full -mt-20 pt-24 pb-16 md:pb-24 overflow-hidden bg-gradient-to-b from-slate-100/80 via-emerald-50/30 to-[#fafbfc]">
      {/* Background Hero Banner with Soft Ambient Curves */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-teal-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold mb-6 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            🧗🏻 The Roaming Birds Presents • Monsoon Weekend Batches
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl leading-tight"
          >
            Wander Far, Discover More.
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-3">
              <span>Break The</span>
              <div className="inline-block relative min-w-[180px] sm:min-w-[280px] text-emerald-600 underline decoration-emerald-400 decoration-wavy">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
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
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed"
          >
            Experience breathtaking Sahyadri waterfalls and misty rainforest trails with certified trek leaders. 
            <span className="text-emerald-700 font-semibold"> Every Friday & Saturday night departures</span> from Mumbai & Pune.
          </motion.p>

          {/* Clean White Elevated Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-4xl mt-10 p-3 sm:p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/60"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              {/* Destination Search */}
              <div className="sm:col-span-5 flex items-center gap-3 px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <FaMapMarkerAlt className="text-emerald-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Where do you want to trek? (e.g. Aadrai, Devkund)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* City Selection */}
              <div className="sm:col-span-4 flex items-center gap-3 px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <FaCompass className="text-emerald-600 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Mumbai">Departure: Mumbai Pickups</option>
                  <option value="Pune">Departure: Pune Pickups</option>
                </select>
              </div>

              {/* Find Treks Button */}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <FaSearch />
                  <span>Find Treks</span>
                </button>
              </div>
            </form>
          </motion.div>

          {/* Social Proof Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-slate-600"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                <FaStar />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-slate-900 text-base">4.9 / 5</span>
                <span className="text-slate-500 block text-[11px]">950+ Google Reviews</span>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                <FaUsers />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-slate-900 text-base">12,000+</span>
                <span className="text-slate-500 block text-[11px]">Happy Trekkers</span>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-teal-100 text-teal-700">
                <FaShieldAlt />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-slate-900 text-base">100% Certified</span>
                <span className="text-slate-500 block text-[11px]">Safe for Female & Solo Travelers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroImage;
