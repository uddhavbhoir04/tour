import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCompass,
  FaShieldAlt,
  FaUtensils,
  FaBus,
  FaUsers,
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkedAlt,
  FaCheckCircle,
  FaStar,
  FaCalendarAlt,
  FaMountain
} from "react-icons/fa";
import HeroImage from "./components/HeroImage";
import SingleCard from "./components/SingleCard";
import { TREK_PACKAGES, ROAMING_BIRDS_CONTACTS } from "../data/roamingBirdsData";

const API = import.meta.env.VITE_API_URL;

const CATEGORIES = [
  { id: "all", label: "All Upcoming Treks" },
  { id: "waterfall", label: "Waterfalls & Lagoons 💦" },
  { id: "jungle", label: "Dense Rainforest Trails 🌿" },
  { id: "malshej", label: "Malshej Ghat" },
  { id: "tamhini", label: "Tamhini Ghat" },
  { id: "easy", label: "Beginner Friendly" },
];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [packagesList, setPackagesList] = useState(TREK_PACKAGES);
  const [activeCityTab, setActiveCityTab] = useState("mumbai");

  // Attempt to fetch from backend, but always fallback to official Roaming Birds packages
  useEffect(() => {
    const fetchBackendPackages = async () => {
      try {
        if (!API) return;
        const res = await fetch(`${API}/api/package/get-packages?limit=10`);
        const data = await res.json();
        if (data?.success && data?.packages?.length > 0) {
          // Merge API packages with authentic Roaming Birds treks
          const apiIds = new Set(data.packages.map((p) => p.packageName?.toLowerCase()));
          const extra = TREK_PACKAGES.filter(
            (p) => !apiIds.has(p.packageName.toLowerCase())
          );
          setPackagesList([...data.packages, ...extra]);
        }
      } catch (err) {
        // Fallback gracefully to default authentic data
        setPackagesList(TREK_PACKAGES);
      }
    };
    fetchBackendPackages();
  }, []);

  // Filter packages based on activeCategory
  const filteredPackages = packagesList.filter((pkg) => {
    if (activeCategory === "all") return true;
    const name = (pkg.packageName || "").toLowerCase();
    const dest = (pkg.packageDestination || "").toLowerCase();
    const diff = (pkg.difficulty || "").toLowerCase();

    if (activeCategory === "waterfall") {
      return name.includes("waterfall") || name.includes("kalu") || name.includes("devkund") || name.includes("nanemachi");
    }
    if (activeCategory === "jungle") {
      return name.includes("jungle") || name.includes("andharban") || name.includes("aadrai");
    }
    if (activeCategory === "malshej") {
      return dest.includes("malshej") || name.includes("aadrai") || name.includes("kalu");
    }
    if (activeCategory === "tamhini") {
      return dest.includes("tamhini") || name.includes("andharban") || name.includes("devkund");
    }
    if (activeCategory === "easy") {
      return diff.includes("easy") || diff.includes("normal");
    }
    return true;
  });

  return (
    <div className="w-full bg-zinc-950 text-white min-h-screen">
      {/* 1. Hero Section */}
      <HeroImage />

      {/* 2. Upcoming Weekend Treks Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <FaCalendarAlt /> Weekend Batches Open
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Featured Sahyadri Expeditions
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Lock your slot for just ₹500 - ₹700 advance. Unlimited authentic village meals, AC transport & certified guides included.
            </p>
          </div>

          <Link
            to="/search"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>View All Schedules</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Category Pills (Trekkaro style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                activeCategory === cat.id
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Treks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPackages.map((trek) => (
            <SingleCard key={trek._id || trek.slug} packageData={trek} />
          ))}
        </div>
      </section>

      {/* 3. Why Choose The Roaming Birds (Trust Grid) */}
      <section className="bg-zinc-900/50 border-y border-zinc-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              The TRB Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Why 12,000+ Adventurers Choose Us
            </h2>
            <p className="text-zinc-400 text-sm mt-2">
              We make trekking in Maharashtra safe, memorable, and hassle-free with end-to-end management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-4">
                <FaBus />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Comfortable Transport</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Clean AC / Non-AC private buses with pickups across Mumbai (Borivali to Kalyan) & Pune (Shivajinagar to Hinjewadi).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-4">
                <FaUtensils />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Unlimited Local Food</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Authentic, piping-hot breakfast and rural village lunch cooked by local families (Veg, Non-Veg, and Jain options).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-4">
                <FaShieldAlt />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Safety & First Aid</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Certified trek leaders, local village guides, forest permits, first aid kits, and a strict 100% zero-alcohol policy.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-4">
                <FaUsers />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Solo & Female Friendly</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Warm and inclusive community atmosphere where solo travelers make lifelong trek buddies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pickup Points Quick Lookup (Mumbai & Pune Routes) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 border border-zinc-800 p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FaMapMarkedAlt /> Seamless Boarding
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Pickup Points & Timelines
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Multiple convenient boarding stops along Western Express Highway, Eastern Express Highway & Pune bypass.
              </p>
            </div>

            {/* City Tabs */}
            <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActiveCityTab("mumbai")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  activeCityTab === "mumbai"
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Mumbai Pickups (7+ Stops)
              </button>
              <button
                onClick={() => setActiveCityTab("pune")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  activeCityTab === "pune"
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Pune Pickups (5 Stops)
              </button>
            </div>
          </div>

          {activeCityTab === "mumbai" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">09:30 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Borivali (National Park Gate)</p>
                <span className="text-[11px] text-zinc-500">WEH Main Junction</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">09:45 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Andheri (Gundavali Metro)</p>
                <span className="text-[11px] text-zinc-500">Western Express Highway</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">10:00 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Bandra (Kalanagar Junction)</p>
                <span className="text-[11px] text-zinc-500">Bandra East Highway</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">10:30 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Sion (Chunabhatti)</p>
                <span className="text-[11px] text-zinc-500">Sion Circle flyover</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">10:40 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Chembur (Amar Mahal)</p>
                <span className="text-[11px] text-zinc-500">Eastern Express Highway</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">11:00 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Thane / Vashi</p>
                <span className="text-[11px] text-zinc-500">Teen Hath Naka / Vashi Plaza</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">11:45 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Panvel / Kharghar</p>
                <span className="text-[11px] text-zinc-500">Kalamboli McDonald's</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">12:15 AM</span>
                <p className="text-sm font-semibold text-white mt-1">Kalyan</p>
                <span className="text-[11px] text-zinc-500">Shivaji Maharaj Chowk</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">11:00 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Ch. Shivaji Nagar</p>
                <span className="text-[11px] text-zinc-500">Bank of Maharashtra</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">11:15 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Nashik Phata</p>
                <span className="text-[11px] text-zinc-500">Highway flyover</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">11:30 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Bhosari / Wakad</p>
                <span className="text-[11px] text-zinc-500">Bhosari Pickup / Wakad Bridge</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">11:45 PM</span>
                <p className="text-sm font-semibold text-white mt-1">Moshi / Hinjewadi</p>
                <span className="text-[11px] text-zinc-500">Bharat Mata Chowk / Infosys</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-emerald-400 text-xs font-bold">12:00 AM</span>
                <p className="text-sm font-semibold text-white mt-1">Chakan Chowk</p>
                <span className="text-[11px] text-zinc-500">Highway junction</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Booking Process Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Quick 3-Step Booking
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            How to Lock Your Slot
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              1
            </span>
            <h3 className="text-base font-bold text-white mb-2">Choose Trek & City</h3>
            <p className="text-xs text-zinc-400">
              Select your adventure (Aadrai, Andharban, Devkund, Kalu, Nanemachi) and preferred Mumbai or Pune pickup point.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              2
            </span>
            <h3 className="text-base font-bold text-white mb-2">Pay Advance (₹500 / ₹700)</h3>
            <p className="text-xs text-zinc-400">
              Pay via any UPI App (GPay, PhonePe, Paytm) to <span className="text-emerald-400 font-bold">{ROAMING_BIRDS_CONTACTS.upiNumber}</span> ({ROAMING_BIRDS_CONTACTS.upiHolderName}).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              3
            </span>
            <h3 className="text-base font-bold text-white mb-2">WhatsApp Confirmation</h3>
            <p className="text-xs text-zinc-400">
              Send the payment screenshot with Name, Trek Name, & Pickup Stop to <span className="text-emerald-400 font-bold">{ROAMING_BIRDS_CONTACTS.primaryPhone}</span>. You'll be added to the batch WhatsApp group!
            </p>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Action Button (Trekkaro style) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <a
          href={`https://wa.me/${ROAMING_BIRDS_CONTACTS.whatsappNumber}?text=Hi%20The%20Roaming%20Birds!%20I%20want%20to%20book%20a%20slot%20for%20this%20weekend.`}
          target="_blank"
          rel="noreferrer"
          className="relative group flex items-center gap-2 p-3.5 sm:px-5 sm:py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full shadow-2xl shadow-emerald-500/50 transition-transform duration-300 hover:scale-105"
        >
          <span className="absolute -inset-1 rounded-full bg-emerald-400 animate-ping opacity-30"></span>
          <FaWhatsapp size={24} className="relative z-10" />
          <span className="hidden sm:inline relative z-10 text-sm">
            Chat & Book on WhatsApp
          </span>
        </a>
      </div>
    </div>
  );
};

export default Home;
