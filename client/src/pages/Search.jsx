import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SingleCard from "./components/SingleCard";
import { TREK_PACKAGES } from "../data/roamingBirdsData";
import { FaSearch, FaFilter, FaCompass } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState("featured");
  const [packages, setPackages] = useState(TREK_PACKAGES);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get("searchTerm") || "";
    setSearchTerm(query);

    const fetchPackages = async () => {
      try {
        if (API) {
          const res = await fetch(`${API}/api/package/get-packages?${urlParams.toString()}`);
          const data = await res.json();
          if (data?.success && data?.packages?.length > 0) {
            const apiNames = new Set(data.packages.map((p) => p.packageName?.toLowerCase()));
            const extra = TREK_PACKAGES.filter((p) => !apiNames.has(p.packageName.toLowerCase()));
            setPackages([...data.packages, ...extra]);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }
      setPackages(TREK_PACKAGES);
    };

    fetchPackages();
  }, [location.search]);

  const filteredPackages = packages.filter((pkg) => {
    const name = (pkg.packageName || "").toLowerCase();
    const dest = (pkg.packageDestination || "").toLowerCase();
    const region = (pkg.region || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      !query ||
      name.includes(query) ||
      dest.includes(query) ||
      region.includes(query);

    const diff = (pkg.difficulty || "").toLowerCase();
    const matchesDiff =
      selectedDifficulty === "all" ||
      diff.includes(selectedDifficulty.toLowerCase());

    const price = pkg.mumbaiPrice || pkg.packagePrice || 1400;
    const matchesPrice = price <= maxPrice;

    return matchesSearch && matchesDiff && matchesPrice;
  }).sort((a, b) => {
    const priceA = a.mumbaiPrice || a.packagePrice || 0;
    const priceB = b.mumbaiPrice || b.packagePrice || 0;
    const ratingA = a.packageRating || 0;
    const ratingB = b.packageRating || 0;

    if (sortBy === "price_asc") return priceA - priceB;
    if (sortBy === "price_desc") return priceB - priceA;
    if (sortBy === "rating") return ratingB - ratingA;
    return 0;
  });

  const handleApplyFilter = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("searchTerm", searchTerm);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full bg-[#fafbfc] text-slate-800 min-h-screen -mt-20 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Adventure Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            Search & Filter Sahyadri Treks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse upcoming weekend departures from Mumbai & Pune.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filter Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FaFilter className="text-emerald-600" size={14} /> Filter Options
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDifficulty("all");
                  setMaxPrice(2000);
                  setSortBy("featured");
                  navigate("/search");
                }}
                className="text-xs text-slate-500 hover:text-emerald-700 transition"
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleApplyFilter} className="space-y-5">
              {/* Keyword Search */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Trek Name or Region
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Aadrai, Andharban, Kalu"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-slate-400" size={12} />
                </div>
              </div>

              {/* Difficulty Grade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "all", label: "All" },
                    { id: "easy", label: "Easy" },
                    { id: "moderate", label: "Moderate" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDifficulty(d.id)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition ${
                        selectedDifficulty === d.id
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Budget Slider */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-bold text-slate-700">Max Budget</span>
                  <span className="font-bold text-emerald-700">₹{maxPrice}/-</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="2000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹1200</span>
                  <span>₹2000</span>
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sort Results By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="featured">Featured / Recommended</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition shadow-sm hover:shadow-md shadow-emerald-600/30"
              >
                Apply Filters
              </button>
            </form>
          </div>

          {/* Results Grid (8 cols) */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
              <span className="font-semibold">Showing {filteredPackages.length} Adventures</span>
              <span>Every Weekend Batches</span>
            </div>

            {filteredPackages.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm">
                <FaCompass className="mx-auto text-slate-400 mb-3" size={36} />
                <h3 className="text-base font-bold text-slate-900 mb-1">No treks found</h3>
                <p className="text-xs text-slate-500">
                  Try adjusting your search terms or increasing the budget filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPackages.map((trek) => (
                  <SingleCard key={trek._id || trek.slug} packageData={trek} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
