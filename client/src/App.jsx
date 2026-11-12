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
import Search from "./pages/Search";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./pages/components/Footer";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import "leaflet/dist/leaflet.css";
import AIChat from "./pages/components/AIChat";
import BlogPost from "./pages/BlogPost";
import { SettingsProvider } from "./context/SettingsContext";
const App = () => {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Header />
        <main className="w-full pt-20 sm:pt-28 min-h-screen bg-[#fafbfc] text-slate-800">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<Search />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
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
          </Routes>
        </main>
        <ToastContainer />
        <Footer />
        {/* AI assistant lives inside the router so its links work */}
        <AIChat />
      </BrowserRouter>
    </SettingsProvider>
  );
};

export default App;
