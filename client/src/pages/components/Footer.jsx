import React from "react";
import { Link } from "react-router-dom";
import {
  FaWhatsapp,
  FaPhoneAlt,
  FaShieldAlt,
  FaLeaf
} from "react-icons/fa";
import TRB_Logo from "../../assets/images/TRB_Logo.png";
import { ROAMING_BIRDS_CONTACTS } from "../../data/roamingBirdsData";

const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-300 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white p-1 border border-slate-700 shadow-sm">
                <img
                  src={TRB_Logo}
                  alt="The Roaming Birds"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  The Roaming Birds 🕊️
                </span>
                <span className="block text-xs text-emerald-400 font-bold">
                  Sahyadri & Western Ghats Expeditions
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Connecting nature lovers with Maharashtra's most stunning misty rainforests, hidden waterfalls, and rugged mountain trails. Safe, guided weekend expeditions with unlimited authentic local food.
            </p>

            <div className="flex items-center gap-3 text-xs pt-1">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-medium">
                <FaLeaf /> Leave No Trace Eco-Trekking
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                <FaShieldAlt /> 100% Zero-Alcohol
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition">
                  Upcoming Batches
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-emerald-400 transition">
                  All Monsoon Treks
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">
                  About Our Team
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-emerald-400 transition">
                  Trek Safety Guides
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition">
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Featured Destinations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Popular Trails
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/package/aadrai-jungle-trek" className="hover:text-emerald-400 transition">
                  Aadrai Jungle Trek
                </Link>
              </li>
              <li>
                <Link to="/package/andharban-jungle-trek" className="hover:text-emerald-400 transition">
                  Andharban Dark Forest
                </Link>
              </li>
              <li>
                <Link to="/package/devkund-waterfall-trek" className="hover:text-emerald-400 transition">
                  Devkund Secret Waterfall
                </Link>
              </li>
              <li>
                <Link to="/package/kalu-waterfall-trek" className="hover:text-emerald-400 transition">
                  Kalu Waterfall 5-Tier View
                </Link>
              </li>
              <li>
                <Link to="/package/nanemachi-waterfall-trek" className="hover:text-emerald-400 transition">
                  Nanemachi 400ft Drop
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Registration Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Registration & Help
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block">WhatsApp Bookings:</span>
                <a
                  href={`https://wa.me/${ROAMING_BIRDS_CONTACTS.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-400 hover:underline flex items-center gap-1.5"
                >
                  <FaWhatsapp size={14} />
                  {ROAMING_BIRDS_CONTACTS.primaryPhone}
                </a>
              </div>

              <div>
                <span className="text-slate-400 block">Trek Leaders:</span>
                <span className="text-slate-200 block">
                  Pratik: <a href="tel:7507670366" className="text-white hover:text-emerald-400">7507670366</a>
                </span>
                <span className="text-slate-200 block">
                  Uddhav: <a href="tel:9922256210" className="text-white hover:text-emerald-400">9922256210</a>
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block">Advance Slot UPI:</span>
                <span className="font-mono font-bold text-white">
                  {ROAMING_BIRDS_CONTACTS.upiNumber}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  ({ROAMING_BIRDS_CONTACTS.upiHolderName})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} <span className="text-white font-semibold">The Roaming Birds India</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Mumbai & Pune Weekend Batches</span>
            <span>•</span>
            <span>Western Ghats, Maharashtra</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
