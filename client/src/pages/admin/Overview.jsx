import { BarChart, Bar, ResponsiveContainer, Tooltip, YAxis, XAxis, CartesianGrid } from "recharts";
import { useApi } from "../../hooks/useApi";
import { ErrorState } from "../components/StateViews";

const Tile = ({ label, value, hint }) => (
  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{value}</p>
    {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
  </div>
);

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const monthLabel = (m) => new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

const Overview = () => {
  const { data: stats, loading, error, reload } = useApi("/api/admin/stats", { select: (d) => d.stats });
  if (loading) return <p className="p-4 text-sm text-slate-500">Loading stats…</p>;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const chart = (stats.monthly || []).map((m) => ({ ...m, label: monthLabel(m.month) }));
  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Tile label="Revenue (non-cancelled)" value={inr(stats.revenue)} />
        <Tile label="Bookings" value={stats.bookings} hint={`${stats.trekkers} trekkers`} />
        <Tile label="Awaiting payment" value={stats.pendingPayments} hint="See Payments tab" />
        <Tile label="Active treks" value={stats.packages} />
        <Tile label="Customers" value={stats.users} />
        <Tile label="New messages" value={stats.newMessages} />
      </div>
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Revenue by trek month</h2>
        {chart.length ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v, name) => (name === "revenue" ? inr(v) : v)} />
                <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No bookings in the last 12 months yet.</p>
        )}
      </div>
    </div>
  );
};

export default Overview;
