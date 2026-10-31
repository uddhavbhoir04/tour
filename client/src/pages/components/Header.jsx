import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultProfileImg from "../../assets/images/profile.png";
import TRB_Logo from "../../assets/images/TRB_Logo.png";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaBars,
  FaTimes,
  FaSearch
} from "react-icons/fa";
import { ROAMING_BIRDS_CONTACTS } from "../../data/roamingBirdsData";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const activeLink = location.pathname;

  const linkClass = (path) =>
    `relative text-sm font-semibold transition-all duration-200 py-1 ${
      activeLink === path
        ? "text-emerald-700 after:w-full"
        : "text-slate-700 hover:text-emerald-600 after:w-0 hover:after:w-full"
    } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-emerald-600 after:transition-all after:duration-300`;

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top announcement bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Weekend Batches Open
            </span>
            <span className="text-slate-300 font-medium">Every Friday & Saturday Night Departure from Mumbai & Pune</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href={`tel:${ROAMING_BIRDS_CONTACTS.callNumber1}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition"
            >
              <FaPhoneAlt size={11} className="text-emerald-400" />
              <span>{ROAMING_BIRDS_CONTACTS.primaryPhone}</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href={`https://wa.me/${ROAMING_BIRDS_CONTACTS.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              <FaWhatsapp size={14} />
              <span>WhatsApp Booking</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Clean Light Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
            onClick={() => setMenuOpen(false)}
          >
            <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-50 p-1 border border-slate-200 group-hover:shadow-md transition duration-300">
              <img
                src={TRB_Logo}
                alt="The Roaming Birds"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-1">
                The Roaming Birds <span className="text-emerald-600 text-sm">🕊️</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-emerald-700 font-bold -mt-0.5">
                Sahyadri Adventure Treks
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>
            <Link to="/search" className={linkClass("/search")}>
              Explore Treks
            </Link>
            <Link to="/about" className={linkClass("/about")}>
              About Us
            </Link>
            <Link to="/blog" className={linkClass("/blog")}>
              Trek Guides
            </Link>
            <Link to="/contact" className={linkClass("/contact")}>
              Contact
            </Link>
          </nav>

          {/* Right Action / Profile */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/search"
              className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Search Treks"
            >
              <FaSearch size={15} />
            </Link>

            <a
              href={`https://wa.me/${ROAMING_BIRDS_CONTACTS.whatsappNumber}?text=Hi%20The%20Roaming%20Birds!%20I%20want%20to%20inquire%20about%20upcoming%20monsoon%20treks.`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-sm hover:shadow-md shadow-emerald-600/30"
            >
              <FaWhatsapp size={15} />
              <span>Book Slot</span>
            </a>

            {currentUser ? (
              <Link
                to={`/profile/${
                  currentUser.user_role === 1 ? "admin" : "user"
                }`}
                className="flex items-center gap-2 pl-2 border-l border-slate-200"
              >
                <img
                  src={
                    currentUser?.avatar
                      ? `http://localhost:8000/images/${currentUser?.avatar}`
                      : defaultProfileImg
                  }
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                />
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl">
          <div className="flex flex-col gap-4 text-base font-semibold">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-slate-800 hover:text-emerald-600 py-1"
            >
              Home
            </Link>
            <Link
              to="/search"
              onClick={() => setMenuOpen(false)}
              className="text-slate-800 hover:text-emerald-600 py-1 flex items-center justify-between"
            >
              <span>Explore All Treks</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                5 Active
              </span>
            </Link>
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="text-slate-800 hover:text-emerald-600 py-1"
            >
              About Us
            </Link>
            <Link
              to="/blog"
              onClick={() => setMenuOpen(false)}
              className="text-slate-800 hover:text-emerald-600 py-1"
            >
              Trek Blog
            </Link>
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="text-slate-800 hover:text-emerald-600 py-1"
            >
              Contact Us
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-3">
            <a
              href={`https://wa.me/${ROAMING_BIRDS_CONTACTS.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <FaWhatsapp size={18} />
              <span>Instant WhatsApp Booking</span>
            </a>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>Need help? Call Pratik:</span>
              <a
                href={`tel:${ROAMING_BIRDS_CONTACTS.pratikPhone}`}
                className="text-emerald-700 font-bold"
              >
                {ROAMING_BIRDS_CONTACTS.pratikPhone}
              </a>
            </div>

            {currentUser ? (
              <Link
                to={`/profile/${
                  currentUser.user_role === 1 ? "admin" : "user"
                }`}
                onClick={() => setMenuOpen(false)}
                className="w-full block text-center py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800"
              >
                Go to Profile
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full block text-center py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
