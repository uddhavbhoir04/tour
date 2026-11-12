// Site-wide content (formerly hardcoded in Header/Footer/Home/HeroImage/About/Blog)
import { ROAMING_BIRDS_CONTACTS as C } from "./treks.data.js";

export const TREK_CATEGORIES = {
  "aadrai-jungle-trek": ["jungle", "malshej", "easy"],
  "andharban-jungle-trek": ["jungle", "tamhini", "easy"],
  "devkund-waterfall-trek": ["waterfall", "tamhini"],
  "kalu-waterfall-trek": ["waterfall", "malshej"],
  "nanemachi-waterfall-trek": ["waterfall", "easy"],
};

export const SITE_SETTINGS = {
  key: "main",
  brandName: C.brandName,
  tagline: C.tagline,
  announcement: "Every Friday & Saturday Night Departure from Mumbai & Pune",
  heroWords: ["Routine", "Noise", "Concrete Jungle", "Stress", "Ordinary"],
  primaryPhone: C.primaryPhone,
  callNumber1: C.callNumber1,
  callNumber2: C.callNumber2,
  contacts: [
    { name: "Pratik", phone: C.pratikPhone },
    { name: "Uddhav", phone: C.uddhavPhone },
  ],
  whatsappNumber: C.whatsappNumber,
  instagram: C.instagram,
  upiId: C.upiId,
  upiHolderName: C.upiHolderName,
  upiNumber: C.upiNumber,
  googleReviewsRating: C.googleReviewsRating,
  reviewsCount: C.reviewsCount,
  trekkersCount: C.trekkersCount,
  priceRangeText: "₹500 - ₹700",
  aboutTitle: "About The Roaming Birds",
  aboutText: [
    "The Roaming Birds organises weekend treks across the Sahyadri and Western Ghats, with Friday and Saturday night departures from Mumbai and Pune.",
    "Every batch is led by certified trek leaders with local village guides, forest permits, first aid and unlimited home-cooked local food — so you can focus on the trail.",
  ],
  trustBadges: [
    { title: "100% Certified", subtitle: "Safe for Female & Solo Travelers" },
  ],
  whyChooseUs: [
    { icon: "bus", title: "Comfortable Transport", description: "Clean AC / Non-AC private buses with pickups across Mumbai (Borivali to Kalyan) & Pune (Shivajinagar to Hinjewadi)." },
    { icon: "food", title: "Unlimited Local Food", description: "Authentic, piping-hot breakfast and rural village lunch cooked by local families (Veg, Non-Veg, and Jain options)." },
    { icon: "shield", title: "Safety & First Aid", description: "Certified trek leaders, local village guides, forest permits, first aid kits, and a strict 100% zero-alcohol policy." },
    { icon: "users", title: "Solo & Female Friendly", description: "Warm and inclusive community atmosphere where solo travelers make lifelong trek buddies." },
  ],
  categories: [
    { key: "all", label: "All Upcoming Treks" },
    { key: "waterfall", label: "Waterfalls & Lagoons 💦" },
    { key: "jungle", label: "Dense Rainforest Trails 🌿" },
    { key: "malshej", label: "Malshej Ghat" },
    { key: "tamhini", label: "Tamhini Ghat" },
    { key: "camping", label: "Camping & Stargazing ⛺" },
    { key: "night-trek", label: "Night & Sunrise Treks 🌄" },
    { key: "adventure", label: "Adventure & Canyons 🧗" },
    { key: "easy", label: "Beginner Friendly" },
  ],
  mumbaiPickups: [
    { time: "09:30 PM", location: "Borivali (National Park)", landmark: "WEH Main Junction" },
    { time: "09:45 PM", location: "Andheri (Gundavali Metro)", landmark: "Western Express Highway" },
    { time: "10:00 PM", location: "Bandra (Kalanagar)", landmark: "Bandra East Junction" },
    { time: "10:30 PM", location: "Sion (Chunabhatti)", landmark: "Sion Circle Highway" },
    { time: "10:40 PM", location: "Chembur (Amar Mahal)", landmark: "Eastern Express Highway" },
    { time: "11:00 PM", location: "Thane / Vashi", landmark: "Teen Hath Naka / Vashi Plaza" },
    { time: "11:45 PM", location: "Panvel / Kharghar", landmark: "Kalamboli McDonald's" },
    { time: "12:15 AM", location: "Kalyan", landmark: "Shivaji Maharaj Chowk" },
  ],
  punePickups: [
    { time: "11:00 PM", location: "Ch. Shivaji Nagar", landmark: "Bank of Maharashtra" },
    { time: "11:15 PM", location: "Nashik Phata", landmark: "Highway flyover" },
    { time: "11:30 PM", location: "Bhosari / Wakad", landmark: "Bhosari / Wakad Bridge" },
    { time: "11:45 PM", location: "Moshi / Hinjewadi", landmark: "Bharat Mata Chowk / Infosys" },
    { time: "12:00 AM", location: "Chakan Chowk", landmark: "Highway junction" },
  ],
  bookingSteps: [
    { title: "Choose Trek & City", description: "Select your adventure and preferred Mumbai or Pune pickup point, then book your slot online." },
    { title: "Pay Advance via UPI", description: `Pay the advance via any UPI app to ${C.upiNumber} (${C.upiHolderName}) and enter the UPI reference on your booking.` },
    { title: "WhatsApp Confirmation", description: `Send the payment screenshot with your booking ID to ${C.primaryPhone}. We'll confirm and add you to the batch WhatsApp group!` },
  ],
};

export const BLOG_POSTS = [
  {
    title: "Monsoon Trekking in the Sahyadris: A Beginner's Guide",
    slug: "monsoon-trekking-beginners-guide",
    excerpt: "Everything first-time trekkers need to know before a rainy-season trek in Maharashtra.",
    content:
      "Monsoon turns the Sahyadris green, but trails get slippery. Wear shoes with good grip (no sandals or crocs), carry a poncho, a torch, 2 litres of water and a dry set of clothes in a plastic bag. Start with an easy trail like Nanemachi or Aadrai, always stay with your trek leader, and keep all trash in your backpack.",
    coverImage: "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1200&auto=format&fit=crop",
    author: "The Roaming Birds",
  },
  {
    title: "Waterfall Treks Near Mumbai & Pune You Can Do in a Weekend",
    slug: "weekend-waterfall-treks",
    excerpt: "Kalu, Devkund and Nanemachi — three waterfall treks with overnight departures.",
    content:
      "Kalu Waterfall in Malshej Ghat falls in five tiers and is reached through thick forest. Devkund near Patnus is a blue lagoon fed by three streams. Nanemachi near Mahad is a beginner-friendly trail ending at a wide cascade. All three are done as overnight weekend batches from Mumbai and Pune.",
    coverImage: "https://images.unsplash.com/photo-1546587348-d12660c30c50?q=80&w=1200&auto=format&fit=crop",
    author: "The Roaming Birds",
  },
  {
    title: "What to Pack for a One-Day Trek",
    slug: "what-to-pack-one-day-trek",
    excerpt: "A simple checklist so you don't forget the essentials.",
    content:
      "A 20-30 litre backpack, 2 litres of water, trekking shoes, raincoat or windcheater, torch with spare batteries, energy snacks, cap, sunscreen, personal medicines and an extra pair of dry clothes. Avoid jeans, expensive jewellery and anything you'd be upset to get wet.",
    coverImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop",
    author: "The Roaming Birds",
  },
];
