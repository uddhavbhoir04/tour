import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/client";
import { packageImage } from "../../utils/imageUrl";

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-800",
  AdvancePaid: "bg-blue-100 text-blue-800",
  Paid: "bg-emerald-100 text-emerald-800",
  Refunded: "bg-slate-200 text-slate-700",
  Confirmed: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-slate-200 text-slate-700",
  Booked: "bg-emerald-100 text-emerald-800",
};

export const Badge = ({ value }) => <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${STATUS_STYLES[value] || "bg-slate-100"}`}>{value}</span>;

const Payments = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams({ searchTerm: search });
      if (paymentStatus) q.set("paymentStatus", paymentStatus);
      const { data } = await api.get(`/api/booking/get-allBookings?${q}`);
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, paymentStatus]);

  const update = async (id, body) => {
    setBusyId(id);
    try {
      const { data } = await api.patch(`/api/booking/${id}/payment`, body);
      toast.success(data.message);
      setBookings((list) => list.map((b) => (b._id === id ? { ...b, ...data.booking, packageDetails: b.packageDetails, buyer: b.buyer } : b)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-lg font-bold">Payments</h1>
        <div className="flex gap-2">
          <input className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="border rounded-lg px-2 py-1.5 text-sm" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="AdvancePaid">Advance paid</option>
            <option value="Paid">Paid</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && bookings.length === 0 && <p className="text-sm text-slate-500">No bookings match.</p>}
      {bookings.map((b) => (
        <div key={b._id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-slate-200">
          {packageImage(b.packageDetails) && <img src={packageImage(b.packageDetails)} alt="" className="w-14 h-14 rounded-lg object-cover" />}
          <div className="flex-1 min-w-[200px] text-sm">
            <p className="font-bold text-slate-900">
              {b.packageDetails?.packageName} <span className="text-xs text-slate-400">#{String(b._id).slice(-8).toUpperCase()}</span>
            </p>
            <p className="text-xs text-slate-600">
              {b.fullName || b.buyer?.username} • {b.phone || b.buyer?.phone} • {b.buyer?.email}
            </p>
            <p className="text-xs text-slate-600">
              {b.date} • {b.city} {b.pickupPoint ? `(${b.pickupPoint})` : ""} • {b.persons} pax • Total ₹{b.totalPrice} • Advance ₹{b.advanceAmount}
            </p>
            <p className="text-xs mt-1 flex gap-1 items-center">
              <Badge value={b.status} /> <Badge value={b.paymentStatus} />
              {b.upiTxnRef ? <span className="font-mono text-slate-700">UPI ref: {b.upiTxnRef}</span> : <span className="text-slate-400">no UPI ref yet</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {b.paymentStatus === "Pending" && (
              <button disabled={busyId === b._id} onClick={() => update(b._id, { paymentStatus: "AdvancePaid" })} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                Mark advance paid
              </button>
            )}
            {b.paymentStatus !== "Paid" && b.status !== "Cancelled" && (
              <button disabled={busyId === b._id} onClick={() => update(b._id, { paymentStatus: "Paid" })} className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 disabled:opacity-50">
                Mark fully paid
              </button>
            )}
            {b.status === "Confirmed" && (
              <button disabled={busyId === b._id} onClick={() => update(b._id, { status: "Completed" })} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 disabled:opacity-50">
                Mark completed
              </button>
            )}
            {b.status === "Cancelled" && b.paymentStatus !== "Pending" && b.paymentStatus !== "Refunded" && (
              <button disabled={busyId === b._id} onClick={() => update(b._id, { paymentStatus: "Refunded" })} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 disabled:opacity-50">
                Mark refunded
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Payments;
