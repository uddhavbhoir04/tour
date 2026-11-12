import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  updateUserSuccess,
  logOutStart,
  logOutSuccess,
  logOutFailure,
  deleteUserAccountStart,
  deleteUserAccountSuccess,
  deleteUserAccountFailure,
} from "../../redux/user/userSlice";
import api, { apiFetch } from "../../api/client";
import { imageUrl } from "../../utils/imageUrl";
import Overview from "./Overview";
import AllBookings from "./AllBookings";
import AddPackages from "./AddPackages";
import AllPackages from "./AllPackages";
import AllUsers from "./AllUsers";
import Payments from "./Payments";
import RatingsReviews from "./RatingsReviews";
import History from "./History";
import AdminUpdateProfile from "./AdminUpdateProfile";
import SiteSettings from "./SiteSettings";
import BlogAdmin from "./BlogAdmin";
import Messages from "./Messages";

const PANELS = [
  { id: 0, label: "Overview", Component: Overview },
  { id: 1, label: "Bookings", Component: AllBookings },
  { id: 5, label: "Payments", Component: Payments },
  { id: 2, label: "Add Package", Component: AddPackages },
  { id: 3, label: "All Packages", Component: AllPackages },
  { id: 4, label: "Users", Component: AllUsers },
  { id: 6, label: "Ratings/Reviews", Component: RatingsReviews },
  { id: 7, label: "History", Component: History },
  { id: 9, label: "Site Settings", Component: SiteSettings },
  { id: 10, label: "Blog", Component: BlogAdmin },
  { id: 11, label: "Messages", Component: Messages },
  { id: 8, label: "Edit Profile", Component: AdminUpdateProfile },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPercentage, setPhotoPercentage] = useState(0);
  const [activePanelId, setActivePanelId] = useState(0);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
    avatar: null,
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        address: currentUser.address,
        phone: currentUser.phone,
        avatar: currentUser.avatar,
      });
      setProfilePhoto(currentUser.avatar);
    }
  }, [currentUser]);

  // --- Avatar upload (stored by the backend in /uploads) ---
  const handleFileUpload = async (file) => {
    if (!file) return;
    const data = new FormData();
    data.append("avatar", file);
    try {
      setPhotoPercentage(1);
      const res = await api.post(`/api/user/update/${currentUser._id}`, data, {
        onUploadProgress: (e) => e.total && setPhotoPercentage((e.loaded / e.total) * 100),
      });
      dispatch(updateUserSuccess(res.data.user));
      setProfilePhoto(res.data.user.avatar);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPhotoPercentage(0);
    }
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  // --- Logout ---
  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await apiFetch("/api/auth/logout");
      const data = await res.json();
      if (!data?.success) {
        dispatch(logOutFailure(data?.message));
        return;
      }
      dispatch(logOutSuccess());
      navigate("/login");
      toast.success(data?.message);
    } catch (err) {
      console.log(err);
    }
  };

  // --- Delete Account ---
  const handleDeleteAccount = async () => {
    const CONFIRM = confirm("Are you sure? Account will be permanently deleted!");
    if (!CONFIRM) return;

    try {
      dispatch(deleteUserAccountStart());
      const res = await apiFetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data?.success) {
        dispatch(deleteUserAccountFailure(data?.message));
        toast.error("Something went wrong!");
        return;
      }
      dispatch(deleteUserAccountSuccess());
      toast.success(data?.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex w-full flex-wrap max-sm:flex-col gap-16 p-2">
      {currentUser ? (
        <>
          {/* Sidebar */}
          <div className="w-[25%] p-3 max-sm:w-full">
            <div className="flex flex-col items-center gap-4 p-3 rounded-lg shadow-lg">
              <div className="w-full flex flex-col items-center relative">
                <img
                  src={imageUrl(profilePhoto || formData.avatar)}
                  alt="Profile"
                  className="w-36 h-36 object-cover rounded-full"
                />
                <input
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  onChange={handleProfileFileChange}
                  className="mt-2"
                />
                {photoPercentage > 0 && photoPercentage < 100 && (
                  <p>Uploading: {Math.round(photoPercentage)}%</p>
                )}
              </div>

              <p className="w-full border-b-1 border-black my-2 text-center">
                <span className="font-semibold bg-white px-2">Logged in User Info</span>
              </p>

              <div className="flex justify-between w-full px-1">
                <button
                  onClick={() => setActivePanelId(8)}
                  className="px-8 bg-[#EB662B] text-white font-semibold rounded-lg hover:opacity-95"
                >
                  Edit Profile
                </button>
              </div>

              <div className="w-full flex flex-col gap-3 p-3 shadow-2xl rounded-lg">
                <p>Name</p>
                <p className="border px-3 py-2 font-semibold">{currentUser.username}</p>
                <p>Email</p>
                <p className="border px-3 py-2 font-semibold">{currentUser.email}</p>
                <p>Phone</p>
                <p className="border px-3 py-2 font-semibold">{currentUser.phone}</p>
                <p>Address</p>
                <p className="border px-3 py-2 font-semibold">{currentUser.address}</p>

                <div className="flex justify-between mt-2">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1 bg-[#6358DC] text-white font-semibold rounded-lg"
                  >
                    Logout
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-1 bg-[#EB662B] text-white font-semibold rounded-lg"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className="flex-1 min-w-0 max-sm:w-full">
            <nav className="w-full border-b-4 border-emerald-600 py-3 overflow-x-auto flex gap-2">
              {PANELS.map((panel) => (
                <button
                  key={panel.id}
                  className={`px-2 py-1 whitespace-nowrap text-sm font-semibold rounded-t transition-all duration-300 ${
                    activePanelId === panel.id ? "bg-emerald-600 text-white" : "text-slate-600"
                  }`}
                  onClick={() => setActivePanelId(panel.id)}
                >
                  {panel.label}
                </button>
              ))}
            </nav>

            <div className="content-div flex flex-wrap my-5 w-full">
              {PANELS.filter((p) => p.id === activePanelId).map(({ id, Component }) => (
                <Component key={id} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>
          <p className="text-red-700">Login First</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
