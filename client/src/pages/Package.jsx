import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  FaMapMarkerAlt,
  FaBus,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaWhatsapp,
  FaStar,
  FaSuitcaseRolling,
  FaExclamationTriangle
} from "react-icons/fa";
import { getTrekByIdOrSlug, TREK_PACKAGES, ROAMING_BIRDS_CONTACTS } from "../data/roamingBirdsData";
import BookingModal from "./components/BookingModal";

const API = import.meta.env.VITE_API_URL;

const Package = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("itinerary");
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [trek, setTrek] = useState(() => {
    return getTrekByIdOrSlug(id) || TREK_PACKAGES[0];
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const foundLocal = getTrekByIdOrSlug(id);
    if (foundLocal) {
      setTrek(foundLocal);
      return;
    }

    const fetchPackage = async () => {
      try {
        if (API) {
          const res = await fetch(`${API}/api/package/get-package-data/${id}`);
          const data = await res.json();
          if (data?.success && data?.packageData) {
            setTrek({
              ...TREK_PACKAGES[0],
              ...data.packageData,
              _id: data.packageData._id,
              packageName: data.packageData.packageName,
              packageImages: data.packageData.packageImages?.length
                ? data.packageData.packageImages
                : TREK_PACKAGES[0].packageImages,
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPackage();
  }, [id]);

  const mumbaiPrice = trek.mumbaiPrice || trek.packagePrice || 1400;
  const punePrice = trek.punePrice || trek.packageDiscountPrice || 1300;
  const advance = trek.advanceAmount || 500;

  return (
    <div className="w-full bg-[#fafbfc] text-slate-800 min-h-screen -mt-20 pt-24 pb-20">
      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-emerald-700">Treks</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate">{trek.packageName}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              {trek.badge || "Monsoon Trek"}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Grade: {trek.difficulty || "Moderate"}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-xs font-bold text-slate-800 border border-slate-200 shadow-xs">
              <FaStar className="text-amber-500" size={12} />
              <span>{trek.packageRating || 4.9}</span>
              <span className="text-slate-400 font-normal">({trek.packageTotalRatings || 180} reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            {trek.packageName}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-600 flex items-center gap-2">
            <FaMapMarkerAlt className="text-emerald-600 shrink-0" />
            <span>
              {trek.baseVillage ? `Base Village: ${trek.baseVillage} • ` : ""}
              {trek.region ? `Region: ${trek.region} • ` : ""}
              {trek.packageDestination || "Maharashtra"}
            </span>
          </p>
        </div>

        {/* Gallery / Swiper Hero */}
        <div className="w-full h-[320px] sm:h-[450px] rounded-3xl overflow-hidden shadow-md mb-10 bg-slate-100 border border-slate-200 relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={true}
            className="w-full h-full"
          >
            {(trek.packageImages || []).map((imgUrl, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={imgUrl}
                  alt={`${trek.packageName} - Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-xs font-bold text-slate-800 border border-slate-200 shadow-sm">
            📸 Western Ghats Trail Photos
          </div>
        </div>

        {/* Trek Stats Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 block mb-1">Trail Type</span>
            <span className="text-sm font-bold text-slate-900 line-clamp-1">
              {trek.trailType || "Jungle Trail"}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 block mb-1">Difficulty</span>
            <span className="text-sm font-bold text-emerald-700">
              {trek.difficulty || "Easy to Moderate"}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 block mb-1">Endurance</span>
            <span className="text-sm font-bold text-slate-900">
              {trek.endurance || "Medium / Average"}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 block mb-1">Trek Distance</span>
            <span className="text-sm font-bold text-slate-900">
              {trek.trailLength || "7 km (One side)"}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 block mb-1">Duration</span>
            <span className="text-sm font-bold text-slate-900">
              {trek.duration || "3 hrs (One side)"}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 block mb-1">Best Season</span>
            <span className="text-sm font-bold text-slate-900">
              {trek.bestTime || "June to October"}
            </span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Tabs & Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
              {[
                { id: "itinerary", label: "Itinerary" },
                { id: "pickups", label: "Pickup Points" },
                { id: "inclusions", label: "Inclusions" },
                { id: "whatToCarry", label: "What to Carry" },
                { id: "rules", label: "Rules & Notes" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                    activeTab === t.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: ITINERARY */}
            {activeTab === "itinerary" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Trek Itinerary & Timelines</h3>
                  <p className="text-sm text-slate-500">
                    Schedule may vary slightly depending on weather and trail speed.
                  </p>
                </div>

                <div className="space-y-6">
                  {(trek.itinerary || []).map((dayPlan, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {dayPlan.day}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{dayPlan.title}</h4>
                      </div>

                      <ul className="space-y-3">
                        {dayPlan.items?.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            className="flex items-start gap-3 text-sm text-slate-700"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: PICKUPS */}
            {activeTab === "pickups" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Pickup Stops & Times</h3>
                  <p className="text-sm text-slate-500">
                    AC Private Bus for Mumbai and Non-AC for Pune. Please reach your stop 10 mins prior.
                  </p>
                </div>

                {/* Mumbai Pickups */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FaBus className="text-emerald-600" />
                    Mumbai Pickups (AC Bus)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(trek.mumbaiPickups || []).map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-800">{p.location}</span>
                        <span className="text-xs font-bold text-emerald-800 px-2.5 py-0.5 rounded bg-emerald-100">
                          {p.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pune Pickups */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FaBus className="text-blue-600" />
                    Pune Pickups
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(trek.punePickups || []).map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-800">{p.location}</span>
                        <span className="text-xs font-bold text-blue-800 px-2.5 py-0.5 rounded bg-blue-100">
                          {p.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INCLUSIONS & EXCLUSIONS */}
            {activeTab === "inclusions" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Cost Inclusions & Exclusions</h3>
                  <p className="text-sm text-slate-500">
                    Transparent pricing with zero hidden charges.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Inclusions */}
                  <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm">
                    <h4 className="text-base font-bold text-emerald-800 mb-4 flex items-center gap-2">
                      <FaCheckCircle className="text-emerald-600" /> Cost Includes:
                    </h4>
                    <ul className="space-y-3">
                      {(trek.inclusions || []).map((inc, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <FaCheckCircle className="text-emerald-600 mt-0.5 shrink-0" size={14} />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exclusions */}
                  <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-sm">
                    <h4 className="text-base font-bold text-rose-800 mb-4 flex items-center gap-2">
                      <FaTimesCircle className="text-rose-600" /> Cost Excludes:
                    </h4>
                    <ul className="space-y-3">
                      {(trek.exclusions || []).map((exc, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                          <FaTimesCircle className="text-rose-500 mt-0.5 shrink-0" size={14} />
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: WHAT TO CARRY */}
            {activeTab === "whatToCarry" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Packing Essentials Checklist</h3>
                  <p className="text-sm text-slate-500">
                    Pack light and protect your essentials with waterproof pouches.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(trek.whatToCarry || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <FaSuitcaseRolling size={14} />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: RULES & NOTES */}
            {activeTab === "rules" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Trek Rules & Safety Guidelines</h3>
                  <p className="text-sm text-slate-500">
                    Your safety and nature conservation are our highest priorities.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-4">
                  {(trek.importantRules || []).map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <FaExclamationTriangle className="text-amber-600 mt-1 shrink-0" size={14} />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Sticky Booking Card */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-6">
              {/* Pricing breakdown */}
              <div>
                <span className="text-xs text-slate-500 block">Trek Fees</span>
                <div className="flex items-baseline justify-between mt-1">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900">
                      ₹{mumbaiPrice}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">(Mumbai AC Bus)</span>
                  </div>
                  <div>
                    <span className="text-xl font-extrabold text-emerald-700">
                      ₹{punePrice}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">(Pune Non-AC)</span>
                  </div>
                </div>

                <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                  ⚡ Confirm seat with advance deposit: ₹{advance}/- only!
                  <span className="block text-[11px] font-normal text-emerald-700 mt-0.5">
                    Balance amount payable on trek day.
                  </span>
                </div>
              </div>

              {/* Batch schedule */}
              <div className="text-xs text-slate-600 flex items-center gap-2 border-t border-slate-100 pt-4">
                <FaCalendarAlt className="text-emerald-600" />
                <span className="font-medium">{trek.batchSchedule || "Every Saturday Night Departure"}</span>
              </div>

              {/* Instant Slot Confirmation CTA */}
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="w-full py-4 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 text-base"
              >
                <span>Book Slot (Advance ₹{advance})</span>
              </button>

              {/* Quick WhatsApp Inquiry */}
              <a
                href={`https://wa.me/${ROAMING_BIRDS_CONTACTS.whatsappNumber}?text=Hi%20The%20Roaming%20Birds!%20I%20want%20to%20book%20a%20slot%20for%20${encodeURIComponent(trek.packageName)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl font-bold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-2 transition"
              >
                <FaWhatsapp size={16} />
                <span>Chat with Trek Leader</span>
              </a>

              {/* Direct Call Contacts */}
              <div className="border-t border-slate-100 pt-4 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Pratik:</span>
                  <a href={`tel:${ROAMING_BIRDS_CONTACTS.pratikPhone}`} className="text-slate-900 font-bold hover:text-emerald-700">
                    {ROAMING_BIRDS_CONTACTS.pratikPhone}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span>Uddhav:</span>
                  <a href={`tel:${ROAMING_BIRDS_CONTACTS.uddhavPhone}`} className="text-slate-900 font-bold hover:text-emerald-700">
                    {ROAMING_BIRDS_CONTACTS.uddhavPhone}
                  </a>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span>UPI ID:</span>
                  <span className="text-emerald-700 font-mono font-bold">
                    {ROAMING_BIRDS_CONTACTS.upiNumber} ({ROAMING_BIRDS_CONTACTS.upiHolderName})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        trek={trek}
      />
    </div>
  );
};

export default Package;
