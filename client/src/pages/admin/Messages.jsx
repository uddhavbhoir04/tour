import { toast } from "react-toastify";
import api from "../../api/client";
import { useApi } from "../../hooks/useApi";

const Messages = () => {
  const { data: messages, setData, loading, error } = useApi("/api/contact", { select: (d) => d.messages || [] });

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/api/contact/${id}`, { status });
      setData((list) => list.map((m) => (m._id === id ? { ...m, status } : m)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <h1 className="text-lg font-bold">Contact messages</h1>
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !messages?.length && <p className="text-sm text-slate-500">No messages yet.</p>}
      {(messages || []).map((m) => (
        <div key={m._id} className={`p-3 rounded-lg border ${m.status === "New" ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold">
              {m.name} <span className="font-normal text-slate-500">• {m.email}{m.phone ? ` • ${m.phone}` : ""}</span>
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{new Date(m.createdAt).toLocaleString("en-IN")}</span>
              <select value={m.status} onChange={(e) => setStatus(m._id, e.target.value)} className="border rounded px-1 py-0.5">
                <option>New</option>
                <option>Read</option>
                <option>Replied</option>
              </select>
              <a href={`mailto:${m.email}`} onClick={() => setStatus(m._id, "Replied")} className="font-bold text-emerald-700">Reply</a>
            </div>
          </div>
          <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">{m.message}</p>
        </div>
      ))}
    </div>
  );
};

export default Messages;
