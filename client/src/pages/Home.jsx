import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaBus,
  FaUtensils,
  FaShieldAlt,
  FaUsers,
  FaMapMarkedAlt,
  FaWhatsapp,
} from "react-icons/fa";
import HeroImage from "./components/HeroImage";
import SingleCard from "./components/SingleCard";
import { usePackages } from "../hooks/useApi";
import { useSettings } from "../context/SettingsContext";
import { LoadingGrid, ErrorState, EmptyState } from "./components/StateViews";

const FEATURE_ICONS = {
  bus: { Icon: FaBus, cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  food: { Icon: FaUtensils, cls: "bg-amber-50 text-amber-700 border-amber-100" },
  shield: { Icon: FaShieldAlt, cls: "bg-teal-50 text-teal-700 border-teal-100" },
  users: { Icon: FaUsers, cls: "bg-blue-50 text-blue-700 border-blue-100" },
};

const PickupGrid = ({ pickups = [] }) =>
  pickups.length ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {pickups.map((p) => (
        <div key={`${p.time}-${p.location}`} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-emerald-700 text-xs font-bold">{p.time}</span>
          <p className="text-sm font-bold text-slate-900 mt-1">{p.location}</p>
          {p.landmark && <span className="text-[11px] text-slate-500">{p.landmark}</span>}
        </div>
      ))}
    </div>
  ) : (
    <EmptyState message="Pickup points will be announced soon." />
  );

const Home = () => {
  const { s } = useSettings();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeCityTab, setActiveCityTab] = useState("mumbai");
  const { packages, loading, error, reload } = usePackages({
    limit: 12,
    category: activeCategory === "all" ? "" : activeCategory,
    sort: "packageRating",
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
              Lock your slot with just {s.priceRangeText || "a small"} advance. Unlimited authentic village meals, AC transport & certified guides included.
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
          {(s.categories || []).map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                activeCategory === cat.key
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Treks Grid */}
        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : packages.length === 0 ? (
          <EmptyState message="No treks in this category right now — check back soon!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {packages.map((trek) => (
              <SingleCard key={trek._id} packageData={trek} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Why Choose The Roaming Birds */}
      <section className="bg-slate-50/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
              The TRB Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Why {s.trekkersCount || "Thousands of"} Adventurers Choose Us
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              We make trekking in Maharashtra safe, memorable, and hassle-free with end-to-end management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(s.whyChooseUs || []).map((f) => {
              const { Icon, cls } = FEATURE_ICONS[f.icon] || FEATURE_ICONS.shield;
              return (
                <div key={f.title} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 border ${cls}`}>
                    <Icon />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
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
                Mumbai Pickups ({s.mumbaiPickups?.length || 0} Stops)
              </button>
              <button
                onClick={() => setActiveCityTab("pune")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  activeCityTab === "pune"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pune Pickups ({s.punePickups?.length || 0} Stops)
              </button>
            </div>
          </div>

          <PickupGrid pickups={activeCityTab === "mumbai" ? s.mumbaiPickups : s.punePickups} />
        </div>
      </section>

      {/* 5. Booking Process Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
            Quick {s.bookingSteps?.length || 3}-Step Booking
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How to Lock Your Slot
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(s.bookingSteps || []).map((step, i) => (
            <div key={step.title} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                {i + 1}
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-xs text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating WhatsApp button (sits above the AI assistant button) */}
      {s.whatsappNumber && (
      <div className="fixed bottom-24 right-6 z-40 flex items-center gap-3">
        <a
          href={`https://wa.me/${s.whatsappNumber}?text=Hi%20The%20Roaming%20Birds!%20I%20want%20to%20book%20a%20slot%20for%20this%20weekend.`}
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
      )}
    </div>
  );
};

export default Home;
