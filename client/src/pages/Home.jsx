import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaBus,
  FaUtensils,
  FaShieldAlt,
  FaUsers,
  FaMapMarkedAlt,
  FaWhatsapp,
  FaArrowRight,
  FaCheck
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

  useEffect(() => {
    const fetchBackendPackages = async () => {
      try {
        if (!API) return;
        const res = await fetch(`${API}/api/package/get-packages?limit=10`);
        const data = await res.json();
        if (data?.success && data?.packages?.length > 0) {
          const apiIds = new Set(data.packages.map((p) => p.packageName?.toLowerCase()));
          const extra = TREK_PACKAGES.filter(
            (p) => !apiIds.has(p.packageName.toLowerCase())
          );
          setPackagesList([...data.packages, ...extra]);
        }
      } catch (err) {
        setPackagesList(TREK_PACKAGES);
      }
    };
    fetchBackendPackages();
  }, []);

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
    <div className="w-full bg-[#fafbfc] text-slate-800 min-h-screen">
      {/* 1. Hero Section */}
      <HeroImage />

      {/* 2. Upcoming Weekend Treks Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-emerald-700 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <FaCalendarAlt /> Weekend Batches Open
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Featured Sahyadri Expeditions
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Lock your slot with just ₹500 - ₹700 advance. Unlimited authentic village meals, AC transport & certified guides included.
            </p>
          </div>

          <Link
            to="/search"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>View All Schedules</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 scrollbar-none mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                activeCategory === cat.id
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs"
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

      {/* 3. Why Choose The Roaming Birds */}
      <section className="bg-slate-50/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
              The TRB Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Why 12,000+ Adventurers Choose Us
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              We make trekking in Maharashtra safe, memorable, and hassle-free with end-to-end management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl mb-4 border border-emerald-100">
                <FaBus />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Comfortable Transport</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clean AC / Non-AC private buses with pickups across Mumbai (Borivali to Kalyan) & Pune (Shivajinagar to Hinjewadi).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl mb-4 border border-amber-100">
                <FaUtensils />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Unlimited Local Food</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authentic, piping-hot breakfast and rural village lunch cooked by local families (Veg, Non-Veg, and Jain options).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl mb-4 border border-teal-100">
                <FaShieldAlt />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Safety & First Aid</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Certified trek leaders, local village guides, forest permits, first aid kits, and a strict 100% zero-alcohol policy.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl mb-4 border border-blue-100">
                <FaUsers />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Solo & Female Friendly</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Warm and inclusive community atmosphere where solo travelers make lifelong trek buddies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pickup Points Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FaMapMarkedAlt /> Seamless Boarding
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Pickup Points & Timelines
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Multiple convenient boarding stops along Western Express Highway, Eastern Express Highway & Pune bypass.
              </p>
            </div>

            {/* City Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveCityTab("mumbai")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  activeCityTab === "mumbai"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mumbai Pickups (7+ Stops)
              </button>
              <button
                onClick={() => setActiveCityTab("pune")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  activeCityTab === "pune"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pune Pickups (5 Stops)
              </button>
            </div>
          </div>

          {activeCityTab === "mumbai" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">09:30 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Borivali (National Park)</p>
                <span className="text-[11px] text-slate-500">WEH Main Junction</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">09:45 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Andheri (Gundavali Metro)</p>
                <span className="text-[11px] text-slate-500">Western Express Highway</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">10:00 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Bandra (Kalanagar)</p>
                <span className="text-[11px] text-slate-500">Bandra East Junction</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">10:30 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Sion (Chunabhatti)</p>
                <span className="text-[11px] text-slate-500">Sion Circle Highway</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">10:40 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Chembur (Amar Mahal)</p>
                <span className="text-[11px] text-slate-500">Eastern Express Highway</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">11:00 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Thane / Vashi</p>
                <span className="text-[11px] text-slate-500">Teen Hath Naka / Vashi Plaza</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">11:45 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Panvel / Kharghar</p>
                <span className="text-[11px] text-slate-500">Kalamboli McDonald's</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">12:15 AM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Kalyan</p>
                <span className="text-[11px] text-slate-500">Shivaji Maharaj Chowk</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">11:00 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Ch. Shivaji Nagar</p>
                <span className="text-[11px] text-slate-500">Bank of Maharashtra</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">11:15 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Nashik Phata</p>
                <span className="text-[11px] text-slate-500">Highway flyover</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">11:30 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Bhosari / Wakad</p>
                <span className="text-[11px] text-slate-500">Bhosari / Wakad Bridge</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">11:45 PM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Moshi / Hinjewadi</p>
                <span className="text-[11px] text-slate-500">Bharat Mata Chowk / Infosys</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-emerald-700 text-xs font-bold">12:00 AM</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Chakan Chowk</p>
                <span className="text-[11px] text-slate-500">Highway junction</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Booking Process Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
            Quick 3-Step Booking
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How to Lock Your Slot
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              1
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-2">Choose Trek & City</h3>
            <p className="text-xs text-slate-600">
              Select your adventure (Aadrai, Andharban, Devkund, Kalu, Nanemachi) and preferred Mumbai or Pune pickup point.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              2
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-2">Pay Advance (₹500 / ₹700)</h3>
            <p className="text-xs text-slate-600">
              Pay via any UPI App to <span className="text-emerald-700 font-bold">{ROAMING_BIRDS_CONTACTS.upiNumber}</span> ({ROAMING_BIRDS_CONTACTS.upiHolderName}).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              3
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-2">WhatsApp Confirmation</h3>
            <p className="text-xs text-slate-600">
              Send the payment screenshot with Name, Trek Name, & Pickup Stop to <span className="text-emerald-700 font-bold">{ROAMING_BIRDS_CONTACTS.primaryPhone}</span>. You'll be added to the batch WhatsApp group!
            </p>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <a
          href={`https://wa.me/${ROAMING_BIRDS_CONTACTS.whatsappNumber}?text=Hi%20The%20Roaming%20Birds!%20I%20want%20to%20book%20a%20slot%20for%20this%20weekend.`}
          target="_blank"
          rel="noreferrer"
          className="relative group flex items-center gap-2 p-3.5 sm:px-5 sm:py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-full shadow-xl shadow-green-600/30 transition-transform duration-300 hover:scale-105"
        >
          <span className="absolute -inset-1 rounded-full bg-[#25D366] animate-ping opacity-25"></span>
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
