import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FaRobot, FaTimes, FaPaperPlane, FaHistory, FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import api from "../../api/client";
import { imageUrl } from "../../utils/imageUrl";
import { MiniMarkdown } from "../../utils/miniMarkdown";

const SESSION_KEY = "trb_ai_session";
const GUEST_KEY = "trb_ai_guest";

const storage = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v);
    } catch {
      /* private mode */
    }
  },
};

const getGuestId = () => {
  let id = storage.get(GUEST_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9-]/g, "");
    storage.set(GUEST_KEY, id);
  }
  return id;
};

const QUICK_PROMPTS = ["Suggest an easy trek for beginners", "Which treks have waterfalls?", "What should I carry for a monsoon trek?", "How do I book and pay?"];

const aiHeaders = () => ({ headers: { "x-guest-id": getGuestId() } });

const TrekCard = ({ t, onNavigate }) => (
  <Link
    to={`/package/${t.slug}`}
    onClick={onNavigate}
    className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 transition min-w-[220px]"
  >
    {t.image && <img src={imageUrl(t.image)} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />}
    <div className="min-w-0">
      <p className="text-xs font-bold text-slate-900 line-clamp-2">{t.packageName}</p>
      {t.price ? <p className="text-[11px] text-emerald-700 font-semibold">from ₹{t.price}</p> : null}
    </div>
  </Link>
);

const AIChat = () => {
  const { currentUser } = useSelector((s) => s.user);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("chat"); // chat | history
  const [sessionId, setSessionId] = useState(() => storage.get(SESSION_KEY));
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(null);
  const bottomRef = useRef(null);

  const rememberSession = (id) => {
    setSessionId(id);
    storage.set(SESSION_KEY, id);
  };

  const loadSession = useCallback(async (id) => {
    if (!id) return setMessages([]);
    try {
      const { data } = await api.get(`/api/ai/sessions/${id}`, aiHeaders());
      setMessages(data.session.messages || []);
    } catch {
      // session expired / belongs to another identity
      rememberSession(null);
      setMessages([]);
    }
  }, []);

  // load history + usage when opened or when the logged-in user changes
  useEffect(() => {
    if (!open) return;
    loadSession(sessionId);
    api.get("/api/ai/usage", aiHeaders()).then(({ data }) => setRemaining(data.remaining)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentUser?._id]);

  // a different user logging in/out must not see the previous chat (skip the initial mount)
  const prevUserRef = useRef(currentUser?._id);
  useEffect(() => {
    if (prevUserRef.current === currentUser?._id) return;
    prevUserRef.current = currentUser?._id;
    rememberSession(null);
    setMessages([]);
  }, [currentUser?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const openHistory = async () => {
    setView("history");
    try {
      const { data } = await api.get("/api/ai/sessions", aiHeaders());
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const newChat = () => {
    rememberSession(null);
    setMessages([]);
    setError("");
    setView("chat");
  };

  const deleteSession = async (id) => {
    try {
      await api.delete(`/api/ai/sessions/${id}`, aiHeaders());
      setSessions((s) => s.filter((x) => x._id !== id));
      if (id === sessionId) newChat();
    } catch (err) {
      setError(err.message);
    }
  };

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    setInput("");
    setError("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    setSending(true);
    try {
      const { data } = await api.post("/api/ai/chat", { message, sessionId }, aiHeaders());
      setMessages((m) => [...m, { role: "model", content: data.reply, suggestedTreks: data.suggestedTreks }]);
      if (data.sessionId) rememberSession(data.sessionId);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch (err) {
      setError(err.message);
      if (err.status === 429 && typeof err.data?.remaining === "number") setRemaining(err.data.remaining);
      // drop the unanswered message so it can be resent
      setMessages((m) => m.slice(0, -1));
      setInput(message);
    } finally {
      setSending(false);
    }
  };

  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close trek assistant" : "Open trek assistant"}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl"
      >
        {open ? <FaTimes size={20} /> : <FaRobot size={22} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed z-50 bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-[400px] h-[min(620px,calc(100vh-8rem))] flex flex-col bg-slate-50 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Trek assistant"
          >
            {/* header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-900 text-white">
              <div className="flex items-center gap-2 min-w-0">
                {view === "history" ? (
                  <button onClick={() => setView("chat")} aria-label="Back" className="p-1.5 rounded-lg hover:bg-white/10">
                    <FaArrowLeft size={13} />
                  </button>
                ) : (
                  <FaRobot className="text-emerald-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold">{view === "history" ? "Past chats" : "Birdie · Trek Assistant"}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {remaining !== null ? `${remaining} messages left today` : "Answers from our live trek data"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={openHistory} title="Past chats" className="p-2 rounded-lg hover:bg-white/10">
                  <FaHistory size={13} />
                </button>
                <button onClick={newChat} title="New chat" className="p-2 rounded-lg hover:bg-white/10">
                  <FaPlus size={13} />
                </button>
              </div>
            </div>

            {view === "history" ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {sessions.length === 0 && <p className="text-xs text-slate-500 text-center mt-8">No saved chats yet.</p>}
                {sessions.map((s) => (
                  <div key={s._id} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200">
                    <button
                      onClick={() => {
                        rememberSession(s._id);
                        loadSession(s._id);
                        setView("chat");
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-sm font-semibold text-slate-900 truncate">{s.title || "Chat"}</p>
                      <p className="text-[11px] text-slate-400">{new Date(s.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </button>
                    <button onClick={() => deleteSession(s._id)} aria-label="Delete chat" className="p-2 text-slate-400 hover:text-red-600">
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-slate-700">
                      Hi{currentUser?.username ? ` ${currentUser.username.split(" ")[0]}` : ""}! 👋 I can help you pick a trek, check prices,
                      pickup points and what to carry{currentUser ? ", or look up your bookings" : ""}.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.concat(currentUser ? ["Show my upcoming bookings"] : []).map((q) => (
                        <button key={q} onClick={() => send(q)} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm bg-emerald-600 text-white whitespace-pre-wrap">{m.content}</div>
                    </div>
                  ) : (
                    <div key={i} className="space-y-2">
                      <div className="max-w-[92%] p-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-slate-700">
                        <MiniMarkdown text={m.content} onNavigate={close} />
                      </div>
                      {m.suggestedTreks?.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {m.suggestedTreks.map((t) => (
                            <TrekCard key={t.slug} t={t} onNavigate={close} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}

                {sending && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                    <span className="h-3 w-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    Thinking…
                  </div>
                )}
                {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                <div ref={bottomRef} />
              </div>
            )}

            {view === "chat" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="p-3 border-t border-slate-200 bg-white flex items-end gap-2"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  maxLength={4000}
                  placeholder="Ask about treks, prices, pickups…"
                  className="flex-1 resize-none max-h-28 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  aria-label="Send"
                  className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <FaPaperPlane size={14} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat;
