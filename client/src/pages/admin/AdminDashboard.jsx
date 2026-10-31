// Skip imports for brevity; assume React, Redux, router, toast, Firebase storage functions are imported

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPercentage, setPhotoPercentage] = useState(0);
  const [activePanelId, setActivePanelId] = useState(1);
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

  // --- Firebase Profile Upload ---
  const handleFileUpload = (file) => {
    if (!file) return;

    const storageRef = ref(storage, `profilePhotos/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPhotoPercentage(progress);
      },
      (error) => console.error("Upload failed:", error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setProfilePhoto(downloadURL);
        });
      }
    );
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  // --- Logout ---
  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch(`${API}/api/auth/logout`);
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
      const res = await fetch(`${API}/api/user/delete/${currentUser._id}`, {
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
                  src={profilePhoto || `http://localhost:8000/images/${formData.avatar}`}
                  alt="Profile"
                  className="w-36 h-36 object-cover rounded-full"
                />
                <input
                  type="file"
                  ref={fileRef}
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
          <div className="w-[65%] max-sm:w-full">
            <nav className="w-full border-b-4 border-[#EB662B] py-3 overflow-x-auto flex gap-2">
              {[
                { id: 1, label: "Bookings" },
                { id: 2, label: "Add Packages" },
                { id: 3, label: "All Packages" },
                { id: 4, label: "Users" },
                { id: 5, label: "Payments" },
                { id: 6, label: "Ratings/Reviews" },
                { id: 7, label: "History" },
                { id: 8, label: "Edit Profile" },
              ].map((panel) => (
                <button
                  key={panel.id}
                  className={`p-1 rounded-t transition-all duration-300 ${
                    activePanelId === panel.id ? "bg-[#EB662B] text-white" : ""
                  }`}
                  onClick={() => setActivePanelId(panel.id)}
                >
                  {panel.label}
                </button>
              ))}
            </nav>

            <div className="content-div flex flex-wrap my-5">
              {activePanelId === 1 && <AllBookings />}
              {activePanelId === 2 && <AddPackages />}
              {activePanelId === 3 && <AllPackages />}
              {activePanelId === 4 && <AllUsers />}
              {activePanelId === 5 && <Payments />}
              {activePanelId === 6 && <RatingsReviews />}
              {activePanelId === 7 && <History />}
              {activePanelId === 8 && <AdminUpdateProfile />}
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
