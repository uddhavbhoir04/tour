import { useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./pages/components/Header";
import Profile from "./pages/Profile";
import About from "./pages/About";
import PrivateRoute from "./pages/Routes/PrivateRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./pages/Routes/AdminRoute";
import UpdatePackage from "./pages/admin/UpdatePackage";
import Package from "./pages/Package";
import RatingsPage from "./pages/RatingsPage";
import Booking from "./pages/user/Booking";
import Search from "./pages/Search";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./pages/components/Footer";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import "leaflet/dist/leaflet.css";
import { FaRobot } from "react-icons/fa";
import AskAIModal from "./pages/components/AskAIModal";
const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [aiReply, setAIReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [defaultPrompt, setDefaultPrompt] = useState("");
  const handleAsk = async (question) => {
    setLoading(true);
    try {
      const res = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        method: "post",
        data: {
          contents: [
            {
              parts: [{ text: question }],
            },
          ],
        },
      });
      const response = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAIReply(response || "No answer from AI.");
    } catch (error) {
      console.log(error);
      setAIReply("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <BrowserRouter>
        <Header />
        <main className="w-full pt-20 min-h-screen bg-[#fafbfc] text-slate-800">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<Search />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            {/* user */}
            <Route path="/profile" element={<PrivateRoute />}>
              <Route path="user" element={<Profile />} />
            </Route>
            {/* admin */}
            <Route path="/profile" element={<AdminRoute />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route
                path="admin/update-package/:id"
                element={<UpdatePackage />}
              />
            </Route>
            <Route path="/about" element={<About />} />
            <Route path="/package/:id" element={<Package />} />
            <Route path="/package/ratings/:id" element={<RatingsPage />} />
            {/* checking user auth before booking */}
            <Route path="/booking" element={<PrivateRoute />}>
              <Route path=":packageId" element={<Booking />} />
            </Route>
          </Routes>
        </main>
        <ToastContainer />
        <Footer />
      </BrowserRouter>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl animate-bounce"
      >
        <FaRobot size={24} />
      </button>
      {/* AI Modal */}
      <AskAIModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAsk={handleAsk}
        reply={aiReply}
        loading={loading}
      />
    </>
  );
};

export default App;
