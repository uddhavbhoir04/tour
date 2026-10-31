import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SingleCard from "./components/SingleCard";
import { TREK_PACKAGES } from "../data/roamingBirdsData";
import { FaSearch, FaFilter, FaCompass, FaRupeeSign } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState("featured");
  const [packages, setPackages] = useState(TREK_PACKAGES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get("searchTerm") || "";
    setSearchTerm(query);

    const fetchPackages = async () => {
      try {
        setLoading(true);
        if (API) {
          const res = await fetch(`${API}/api/package/get-packages?${urlParams.toString()}`);
          const data = await res.json();
          if (data?.success && data?.packages?.length > 0) {
            // merge with authentic data
            const apiNames = new Set(data.packages.map((p) => p.packageName?.toLowerCase()));
            const extra = TREK_PACKAGES.filter((p) => !apiNames.has(p.packageName.toLowerCase()));
            setPackages([...data.packages, ...extra]);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      setPackages(TREK_PACKAGES);
    };

    fetchPackages();
  }, [location.search]);

  // Client-side filtering & sorting
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
    <div className="w-full bg-zinc-950 text-white min-h-screen -mt-20 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Adventure Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Search & Filter Sahyadri Treks
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse upcoming weekend departures from Mumbai & Pune.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filter Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FaFilter className="text-emerald-400" size={14} /> Filter Options
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
                className="text-xs text-zinc-400 hover:text-emerald-400 transition"
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleApplyFilter} className="space-y-5">
              {/* Keyword Search */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Trek Name or Region
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Aadrai, Andharban, Kalu"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-zinc-500" size={12} />
                </div>
              </div>

              {/* Difficulty Grade */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
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
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition ${
                        selectedDifficulty === d.id
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
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
                  <span className="font-semibold text-zinc-300">Max Budget</span>
                  <span className="font-bold text-emerald-400">₹{maxPrice}/-</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="2000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>₹1200</span>
                  <span>₹2000</span>
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Sort Results By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="featured">Featured / Recommended</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition shadow-lg shadow-emerald-900/40"
              >
                Apply Filters
              </button>
            </form>
          </div>

          {/* Results Grid (8 cols) */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4 text-xs text-zinc-400">
              <span>Showing {filteredPackages.length} Adventures</span>
              <span>Every Weekend Batches</span>
            </div>

            {filteredPackages.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800">
                <FaCompass className="mx-auto text-zinc-600 mb-3" size={36} />
                <h3 className="text-base font-bold text-white mb-1">No treks found</h3>
                <p className="text-xs text-zinc-400">
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
