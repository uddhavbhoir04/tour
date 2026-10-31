import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
const API = import.meta.env.VITE_API_URL;

const AddPackages = () => {
  const [formData, setFormData] = useState({
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "",
    packageTransportation: "",
    packageMeals: "",
    packageActivities: "",
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageImages: [],
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (e.target.type === "checkbox") {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    }
  };

  const handleFile = (e) => {
    const files = e.target.files;
    setFormData((prevData) => ({
      ...prevData,
      packageImages: Array.from(files), // Convert FileList to an array
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (formData.packageImages.length === 0) {
      toast.error("You must upload at least 1 image");
      return;
    }

    if (
      formData.packageName === "" ||
      formData.packageDescription === "" ||
      formData.packageDestination === "" ||
      formData.packageAccommodation === "" ||
      formData.packageTransportation === "" ||
      formData.packageMeals === "" ||
      formData.packageActivities === "" ||
      formData.packagePrice === 0
    ) {
      toast.error("All fields are required!");
      return;
    }

    if (formData.packagePrice < 500) {
      toast.error("Price should be greater than 500!");
      return;
    }

    if (
      formData.packageOffer &&
      formData.packageDiscountPrice >= formData.packagePrice
    ) {
      toast.error("Regular Price should be greater than Discount Price!");
      return;
    }

    // Prepare FormData
    const data = new FormData();
    data.append("packageName", formData.packageName);
    data.append("packageDescription", formData.packageDescription);
    data.append("packageDestination", formData.packageDestination);
    data.append("packageAccommodation", formData.packageAccommodation);
    data.append("packageTransportation", formData.packageTransportation);
    data.append("packageMeals", formData.packageMeals);
    data.append("packageActivities", formData.packageActivities);
    data.append("packagePrice", formData.packagePrice);
    data.append("packageDiscountPrice", formData.packageDiscountPrice);
    data.append("packageOffer", formData.packageOffer);

    // Append images
    if (Array.isArray(formData.packageImages)) {
      formData.packageImages.forEach((image) => {
        data.append("packageImages", image); // Must match Multer field name
      });
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API}/api/package/update-package/${params?.id}`, // Update API endpoint
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Make sure the Content-Type is set to multipart
          },
          withCredentials: true, // If you're using cookies or sessions for authentication
        }
      );

      console.log(res, "res");

      if (!res.data.success) {
        setError(res.data.message);
        setLoading(false);
        return;
      }

      toast.success(res.data.message || "Package updated successfully!");
      setLoading(false);
      setError(false);

      // Redirect or reset the form if needed
      navigate(`/package/${params?.id}`);
    } catch (err) {
      console.error("Submit error:", err);
      setLoading(false);
      setError("Something went wrong. Try again!");
    }
  };

  return (
    <>
      <div className=" mt-6 w-full min-h-screen flex items-center justify-center bg-[#EB662B] text-white rounded-lg">
        <div className="w-[95%] md:w-[90%] lg:w-[80%]  mx-auto flex flex-col gap-6 rounded-xl shadow-xl py-8">
          {/* Centered Heading */}
          <h1 className="text-center text-lg font-semibold md:text-3xl md:font-bold text-white">
            Add <span className="">Package</span>
          </h1>

          <div className="flex flex-col md:flex-row gap-5 items-center justify-center px-4">
            {/* Right Side: Form */}
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-4"
            >
              <div className="flex flex-col">
                <label>Name:</label>
                <input
                  type="text"
                  id="packageName"
                  value={formData.packageName}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label>Description:</label>
                <textarea
                  id="packageDescription"
                  value={formData.packageDescription}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800  outline-none resize-none"
                />
              </div>

              <div className="flex flex-col">
                <label>Destination:</label>
                <input
                  type="text"
                  id="packageDestination"
                  value={formData.packageDestination}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800  outline-none"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col w-full">
                  <label>Days:</label>
                  <input
                    type="number"
                    id="packageDays"
                    value={formData.packageDays}
                    onChange={handleChange}
                    className="p-2 border rounded bg-gray-200 text-gray-800  outline-none"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label>Nights:</label>
                  <input
                    type="number"
                    id="packageNights"
                    value={formData.packageNights}
                    onChange={handleChange}
                    className="p-2 border rounded bg-gray-200 text-gray-800  outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label>Accommodation:</label>
                <textarea
                  id="packageAccommodation"
                  value={formData.packageAccommodation}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800  outline-none resize-none"
                />
              </div>

              <div className="flex flex-col">
                <label>Transportation:</label>
                <select
                  id="packageTransportation"
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800  outline-none"
                >
                  <option>Select</option>
                  <option>Flight</option>
                  <option>Train</option>
                  <option>Boat</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label>Meals:</label>
                <textarea
                  id="packageMeals"
                  value={formData.packageMeals}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800  outline-none resize-none"
                />
              </div>

              <div className="flex flex-col">
                <label>Activities:</label>
                <textarea
                  id="packageActivities"
                  value={formData.packageActivities}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800  outline-none resize-none"
                />
              </div>

              <div className="flex flex-col">
                <label>Price:</label>
                <input
                  type="number"
                  id="packagePrice"
                  value={formData.packagePrice}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800  outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="packageOffer">Offer:</label>
                <input
                  type="checkbox"
                  id="packageOffer"
                  checked={formData.packageOffer}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
              </div>

              {formData.packageOffer && (
                <div className="flex flex-col">
                  <label>Discount Price:</label>
                  <input
                    type="number"
                    id="packageDiscountPrice"
                    value={formData.packageDiscountPrice}
                    onChange={handleChange}
                    className="p-2 border rounded bg-gray-200 text-gray-800  outline-none"
                  />
                </div>
              )}

              {/* Upload Section */}
              <div>
                <label className="text-sm font-medium   mb-2">
                  Upload Images
                </label>
                <div className="relative flex items-center justify-center w-full cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFile}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="text-gray-500">Click to select images</span>
                </div>

                {/* Image Preview */}
                {formData.packageImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {formData.packageImages.map((file, index) => {
                      const imageUrl = URL.createObjectURL(file);
                      return (
                        <div
                          key={index}
                          className="relative w-full aspect-square border border-gray-300 rounded overflow-hidden"
                        >
                          <img
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || loading}
                className="text-white p-3 rounded bg-black hover:opacity-95 disabled:opacity-70 mt-2"
              >
                {uploading
                  ? "Uploading..."
                  : loading
                  ? "Loading..."
                  : "Create New Package"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddPackages;
