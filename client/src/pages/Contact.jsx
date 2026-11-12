import { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp, FaPhoneAlt, FaInstagram } from "react-icons/fa";
import api from "../api/client";
import { useSettings } from "../context/SettingsContext";

const inputCls = "w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";
const empty = { name: "", email: "", phone: "", message: "" };

const Contact = () => {
  const { s } = useSettings();
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState({ loading: false, ok: false, message: "" });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, ok: false, message: "" });
    try {
      const { data } = await api.post("/api/contact", form);
      setStatus({ loading: false, ok: true, message: data.message });
      setForm(empty);
    } catch (err) {
      setStatus({ loading: false, ok: false, message: err.message });
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="bg-[#fafbfc] py-16 px-4 min-h-screen">
      <motion.div
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="md:col-span-2 bg-slate-900 text-slate-200 rounded-2xl p-8 space-y-5">
          <h2 className="text-2xl font-extrabold text-white">Get in touch</h2>
          <p className="text-sm text-slate-400">Questions about a trek, group bookings or custom batches? We usually reply within a few hours.</p>
          {s.whatsappNumber && (
            <a href={`https://wa.me/${s.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-emerald-400">
              <FaWhatsapp className="text-emerald-400" size={18} /> WhatsApp {s.primaryPhone}
            </a>
          )}
          {(s.contacts || []).map((c) => (
            <a key={c.phone} href={`tel:${c.phone}`} className="flex items-center gap-3 text-sm hover:text-emerald-400">
              <FaPhoneAlt className="text-emerald-400" size={14} /> {c.name}: {c.phone}
            </a>
          ))}
          {s.instagram && (
            <a href={s.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-emerald-400">
              <FaInstagram className="text-emerald-400" size={18} /> Instagram
            </a>
          )}
        </div>

        <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Send us a message</h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Your name" value={form.name} onChange={set("name")} className={inputCls} />
              <input required type="email" placeholder="Your email" value={form.email} onChange={set("email")} className={inputCls} />
            </div>
            <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={set("phone")} className={inputCls} />
            <textarea required rows="5" maxLength={5000} placeholder="Your message" value={form.message} onChange={set("message")} className={inputCls} />
            <button
              type="submit"
              disabled={status.loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
            >
              {status.loading ? "Sending..." : "Send Message"}
            </button>
            {status.message && <p className={`text-sm font-medium ${status.ok ? "text-emerald-700" : "text-red-600"}`}>{status.message}</p>}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
