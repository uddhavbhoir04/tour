import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaFilter, FaCompass } from "react-icons/fa";
import SingleCard from "./components/SingleCard";
import { LoadingGrid, ErrorState } from "./components/StateViews";
import { useApi } from "../hooks/useApi";
import api from "../api/client";

const PAGE_SIZE = 8;

const SORTS = {
  featured: { sort: "packageRating", order: "desc", label: "Featured / Recommended" },
  rating: { sort: "packageTotalRatings", order: "desc", label: "Most Reviewed" },
  price_asc: { sort: "price", order: "asc", label: "Price: Low to High" },
  price_desc: { sort: "price", order: "desc", label: "Price: High to Low" },
  newest: { sort: "createdAt", order: "desc", label: "Newest" },
};

const inputCls =
  "w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500";

const Search = () => {
  const [params, setParams] = useSearchParams();
  const { data: filters } = useApi("/api/package/filters");

  // URL is the source of truth for applied filters
  const applied = {
    searchTerm: params.get("searchTerm") || "",
    difficulty: params.get("difficulty") || "",
    region: params.get("region") || "",
    city: params.get("city") || "",
    maxPrice: params.get("maxPrice") || "",
    sortKey: SORTS[params.get("sort")] ? params.get("sort") : "featured",
  };

  // local form state mirrors the URL until "Apply"
  const [form, setForm] = useState(applied);
  useEffect(() => {
    setForm(applied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const [state, setState] = useState({ packages: [], total: 0, loading: true, loadingMore: false, error: null });
  const query = useMemo(() => {
    const { sort, order } = SORTS[applied.sortKey];
    const q = new URLSearchParams({ sort, order, limit: PAGE_SIZE });
    ["searchTerm", "difficulty", "region", "city", "maxPrice"].forEach((k) => applied[k] && q.set(k, applied[k]));
    return q;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const load = async (startIndex = 0) => {
    setState((s) => ({ ...s, [startIndex ? "loadingMore" : "loading"]: true, error: null }));
    try {
      const q = new URLSearchParams(query);
      q.set("startIndex", startIndex);
      const { data } = await api.get(`/api/package/get-packages?${q}`);
      setState((s) => ({
        packages: startIndex ? [...s.packages, ...data.packages] : data.packages,
        total: data.total,
        loading: false,
        loadingMore: false,
        error: null,
      }));
    } catch (err) {
      setState((s) => ({ ...s, loading: false, loadingMore: false, error: err.message }));
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const apply = (e) => {
    e?.preventDefault();
    const next = new URLSearchParams();
    Object.entries({ ...form, sort: form.sortKey }).forEach(([k, v]) => k !== "sortKey" && v && !(k === "sort" && v === "featured") && next.set(k, v));
    setParams(next);
  };

  const priceMin = filters?.minPrice || 0;
  const priceMax = filters?.maxPrice || 0;
  const maxValue = form.maxPrice || priceMax;

  return (
    <div className="w-full bg-[#fafbfc] text-slate-800 min-h-screen -mt-20 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Adventure Directory</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Search & Filter Treks</h1>
          <p className="text-sm text-slate-500 mt-1">Browse upcoming weekend departures from Mumbai & Pune.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FaFilter className="text-emerald-600" size={14} /> Filter Options
              </h2>
              <button type="button" onClick={() => setParams(new URLSearchParams())} className="text-xs text-slate-500 hover:text-emerald-700 transition">
                Reset
              </button>
            </div>

            <form onSubmit={apply} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Trek Name or Region</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. waterfall, Malshej"
                    value={form.searchTerm}
                    onChange={(e) => setForm({ ...form, searchTerm: e.target.value })}
                    className={`${inputCls} pl-9 placeholder-slate-400`}
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-slate-400" size={12} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Departure City</label>
                <div className="grid grid-cols-3 gap-2">
                  {["", "Mumbai", "Pune"].map((c) => (
                    <button
                      key={c || "any"}
                      type="button"
                      onClick={() => setForm({ ...form, city: c })}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition ${
                        form.city === c ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {c || "Any"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Difficulty Level</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={inputCls}>
                  <option value="">All levels</option>
                  {(filters?.difficulties || []).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Region</label>
                <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={inputCls}>
                  <option value="">All regions</option>
                  {(filters?.regions || []).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {priceMax > priceMin && (
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-slate-700">Max Budget</span>
                    <span className="font-bold text-emerald-700">₹{maxValue}/-</span>
                  </div>
                  <input
                    type="range"
                    min={priceMin}
                    max={priceMax}
                    step="50"
                    value={maxValue}
                    onChange={(e) => setForm({ ...form, maxPrice: Number(e.target.value) >= priceMax ? "" : e.target.value })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>₹{priceMin}</span>
                    <span>₹{priceMax}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Sort Results By</label>
                <select value={form.sortKey} onChange={(e) => setForm({ ...form, sortKey: e.target.value })} className={inputCls}>
                  {Object.entries(SORTS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
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

          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
              <span className="font-semibold">{state.loading ? "Searching..." : `Showing ${state.packages.length} of ${state.total} Adventures`}</span>
              {applied.city && <span>Prices for {applied.city} departure</span>}
            </div>

            {state.loading ? (
              <LoadingGrid count={4} />
            ) : state.error ? (
              <ErrorState message={state.error} onRetry={() => load(0)} />
            ) : state.packages.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm">
                <FaCompass className="mx-auto text-slate-400 mb-3" size={36} />
                <h3 className="text-base font-bold text-slate-900 mb-1">No treks found</h3>
                <p className="text-xs text-slate-500">Try adjusting your search terms or increasing the budget filter.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {state.packages.map((trek) => (
                    <SingleCard key={trek._id} packageData={trek} />
                  ))}
                </div>
                {state.packages.length < state.total && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => load(state.packages.length)}
                      disabled={state.loadingMore}
                      className="px-6 py-3 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-60"
                    >
                      {state.loadingMore ? "Loading..." : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
