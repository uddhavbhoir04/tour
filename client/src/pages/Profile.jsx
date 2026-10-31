import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  logOutStart,
  logOutSuccess,
  logOutFailure,
  deleteUserAccountStart,
  deleteUserAccountSuccess,
  deleteUserAccountFailure,
} from "../redux/user/userSlice";

import MyBookings from "./user/MyBookings";
import UpdateProfile from "./user/UpdateProfile";
import MyHistory from "./user/MyHistory";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [activePanelId, setActivePanelId] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        address: currentUser.address,
        phone: currentUser.phone,
        avatar: currentUser.avatar,
      });
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch(`${API}/api/auth/logout`);
      const data = await res.json();
      if (data?.success !== true) {
        dispatch(logOutFailure(data?.message));
        return;
      }
      dispatch(logOutSuccess());
      navigate("/login");
      toast.success(data?.message);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const CONFIRM = confirm(
      "Are you sure ? the account will be permenantly deleted!"
    );
    if (CONFIRM) {
      try {
        dispatch(deleteUserAccountStart());
        const res = await fetch(`${API}/api/user/delete/${currentUser._id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data?.success === false) {
          dispatch(deleteUserAccountFailure(data?.message));
          toast.error("Something went wrong!");
          return;
        }
        dispatch(deleteUserAccountSuccess());
        toast.success(data?.message);
      } catch (error) {}
    }
  };

  return (
    <div className="flex w-full flex-wrap max-sm:flex-col p-2">
      {currentUser ? (
        <>
          {/* Left Profile Section */}
          <div className="w-[25%] p-3 max-sm:w-full">
            <div className="flex flex-col items-center gap-4 p-3 rounded-lg shadow-lg">
              {/* Profile Picture Section */}
              <div className="w-full flex flex-col items-center relative">
                <img
                  src={
                    currentUser.avatar
                      ? `http://localhost:8000/images/${currentUser.avatar}`
                      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTueIx2Jkawe7r91I50VfVAZLS60yx8RjiSfQ&s"
                  }
                  alt="Profile photo"
                  className="w-36 h-36  rounded-full object-cover"
                />
              </div>
              {/* Upload Button */}

              {/* User Info Divider */}
              <p>
                <span className="font-semibold" style={{ background: "#fff" }}>
                  Logged in user Information
                </span>
              </p>
              {/* Edit Profile Button */}
              <div className="w-full flex justify-between px-1">
                <button
                  onClick={() => setActivePanelId(3)}
                  className="px-8 bg-[#6358DC] text-white text-lg font-semibold flex items-center justify-center my-3 border p-1 rounded-lg hover:text-white"
                >
                  Edit Profile
                </button>
              </div>
              {/* User Details */}
              <div className="w-full flex flex-col gap-3 shadow-2xl rounded-lg p-3 break-all">
                <p>Name</p>
                <p className="text-base font-semibold py-2 border border-gray-300 px-3">
                  {currentUser.username}
                </p>
                <p>Email</p>
                <p className="text-base font-semibold py-2 border border-gray-300 px-3">
                  {currentUser.email}
                </p>
                <p>Phone</p>
                <p className="text-base font-semibold py-2 border border-gray-300 px-3">
                  {currentUser.phone}
                </p>
                <p>Address</p>
                <p className="text-base font-semibold py-2 border border-gray-300 px-3">
                  {currentUser.address}
                </p>
                <div className="flex items-center justify-between">
                  {/* Logout and Delete Account Buttons */}
                  <button
                    onClick={handleLogout}
                    className="px-4 bg-[#6358DC] text-white text-sm  font-semibold flex items-center justify-center my-3 border p-1 rounded-lg hover:text-white"
                  >
                    Logout
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 bg-orange-600 text-white text-sm font-semibold flex items-center justify-center my-3 border p-1 rounded-lg hover:text-white"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel (Bookings and History Section) */}
          <div className="w-[75%] max-sm:w-full">
            <div>
              <nav className="w-full border-blue-500 border-b-4 py-2">
                <div className="w-full flex gap-2">
                  <button
                    className={
                      activePanelId === 1
                        ? "p-1 rounded-t transition-all duration-300 bg-[#6358DC] text-white"
                        : "p-1 rounded-t transition-all duration-300"
                    }
                    id="bookings"
                    onClick={() => setActivePanelId(1)}
                  >
                    Bookings
                  </button>
                  <button
                    className={
                      activePanelId === 2
                        ? "p-1 rounded-t transition-all duration-300 bg-[#6358DC] text-white"
                        : "p-1 rounded-t transition-all duration-300"
                    }
                    id="history"
                    onClick={() => setActivePanelId(2)}
                  >
                    History
                  </button>
                </div>
              </nav>
              {/* Bookings Panel */}
              <div className="main flex flex-wrap">
                {activePanelId === 1 && <MyBookings />}
                {/* History Panel */}
                {activePanelId === 2 && <MyHistory />}
                {/* Update Profile Panel */}
                {activePanelId === 3 && <UpdateProfile />}
              </div>
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

export default Profile;
