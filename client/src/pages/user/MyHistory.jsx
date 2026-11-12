import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import BookingRow from "./BookingRow";

const MyHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQuery(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: bookings, loading, error, reload } = useApi(
    `/api/booking/get-allUserBookings?searchTerm=${encodeURIComponent(query)}`,
    { select: (d) => d.bookings || [] }
  );

  return (
    <div className="w-full flex justify-center">
      <div className="w-[95%] p-3 flex flex-col gap-3">
        <input className="border rounded-lg p-2 text-sm" type="text" placeholder="Search by trek name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        {loading && <p className="text-sm text-slate-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && !bookings?.length && (
          <p className="text-sm text-slate-500">
            No bookings yet. <Link to="/search" className="text-emerald-700 font-bold">Find a trek &rarr;</Link>
          </p>
        )}
        {(bookings || []).map((b) => (
          <BookingRow key={b._id} booking={b} mode="history" onChanged={reload} />
        ))}
      </div>
    </div>
  );
};

export default MyHistory;
