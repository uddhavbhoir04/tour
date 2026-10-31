import React, { useEffect, useState } from "react";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
import Map from "../components/Map";
import StripePayment from "../components/StripePayment";
const API = import.meta.env.VITE_API_URL;

const Booking = () => {
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const handleClick = () => {
    setShowMap(true);
  };

  const [packageData, setPackageData] = useState({
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
    packageRating: 0,
    packageTotalRatings: 0,
    packageImages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [bookingData, setBookingData] = useState({
    totalPrice: 0,
    packageDetails: null,
    buyer: null,
    persons: 1,
    date: null,
  });
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const getPackageData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API}/api/package/get-package-data/${params?.packageId}`
      );
      const data = await res.json();
      if (data?.success) {
        setPackageData({
          packageName: data?.packageData?.packageName,
          packageDescription: data?.packageData?.packageDescription,
          packageDestination: data?.packageData?.packageDestination,
          packageDays: data?.packageData?.packageDays,
          packageNights: data?.packageData?.packageNights,
          packageAccommodation: data?.packageData?.packageAccommodation,
          packageTransportation: data?.packageData?.packageTransportation,
          packageMeals: data?.packageData?.packageMeals,
          packageActivities: data?.packageData?.packageActivities,
          packagePrice: data?.packageData?.packagePrice,
          packageDiscountPrice: data?.packageData?.packageDiscountPrice,
          packageOffer: data?.packageData?.packageOffer,
          packageRating: data?.packageData?.packageRating,
          packageTotalRatings: data?.packageData?.packageTotalRatings,
          packageImages: data?.packageData?.packageImages,
        });
        setLoading(false);
      } else {
        setError(data?.message || "Something went wrong!");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //get paymentgateway token
  const getToken = async () => {
    try {
      const { data } = await axios.get(`${API}/api/package/braintree/token`);
      setClientToken(data?.clientToken);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getToken();
  }, [currentUser]);

  //handle payment & book package
  const handleBookPackage = async () => {
    if (
      bookingData.packageDetails === "" ||
      bookingData.buyer === "" ||
      bookingData.totalPrice <= 0 ||
      bookingData.persons <= 0 ||
      bookingData.date === ""
    ) {
      alert("All fields are required!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `${API}/api/booking/book-package/${params?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(bookingData),
        }
      );
      const data = await res.json();
      if (data?.success) {
        setLoading(false);
        toast.success(data?.message);
        navigate(`/profile/${currentUser?.user_role === 1 ? "admin" : "user"}`);
      } else {
        setLoading(false);
        toast.error(data?.message);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.packageId) {
      getPackageData();
    }
    let date = new Date().toISOString().substring(0, 10);
    let d = date.substring(0, 8) + (parseInt(date.substring(8)) + 1);
    setCurrentDate(d);
  }, [params?.packageId]);

  useEffect(() => {
    if (packageData && params?.packageId) {
      setBookingData({
        ...bookingData,
        packageDetails: params?.packageId,
        buyer: currentUser?._id,
        totalPrice: packageData?.packageDiscountPrice
          ? packageData?.packageDiscountPrice * bookingData?.persons
          : packageData?.packagePrice * bookingData?.persons,
      });
    }
  }, [packageData, params]);

  return (
    <div className="w-full flex flex-col items-center rounded-full">
      <div className="w-[95%] rounded-lg flex flex-col items-center p-6  shadow-md gap-6">
        <h1 className="text-center font-bold text-2xl">Book Package</h1>
        {/* user info */}
        <div className="w-full flex flex-wrap justify-center gap-2">
          <div className="pr-3 md:border-r md:pr-6">
            <div className="w-full  flex items-center justify-center bg-[#EB662B]">
              <div className="w-full text-white mx-auto flex flex-col gap-6 p-6 rounded-md">
                <div className="flex flex-col gap-4 w-full">
                  <div className="w-full">
                    <label className="font-semibold">Username:</label>
                    <input
                      type="text"
                      id="username"
                      className="w-full text-gray-800 mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                      value={currentUser.username}
                      disabled
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-semibold">Email:</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full text-gray-800 mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                      value={currentUser.email}
                      disabled
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-semibold">Address:</label>
                    <textarea
                      maxLength={200}
                      id="address"
                      className="w-full text-gray-800 mt-2 p-3 border rounded-md bg-gray-200 outline-none resize-none"
                      value={currentUser.address}
                      disabled
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-semibold">Phone:</label>
                    <input
                      type="text"
                      id="phone"
                      className="w-full text-gray-800 mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                      value={currentUser.phone}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* package info */}
          <div className="pl-3 md:border-l md:pl-6">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-6">
                <img
                  className="w-28"
                  src={`http://localhost:8000/images/${packageData.packageImages[0]}`}
                  alt="Package image"
                />
                <div>
                  <p className="font-semibold text-lg font-gray-800 mb-1 capitalize">
                    {packageData.packageName}
                  </p>
                  <p className="flex gap-2 text-green-700 font-semibold capitalize items-center">
                    <FaMapMarkerAlt
                      onClick={handleClick}
                      className="cursor-pointer"
                    />{" "}
                    {packageData.packageDestination}
                  </p>
                  {/* days & nights */}
                  {(+packageData.packageDays > 0 ||
                    +packageData.packageNights > 0) && (
                    <p className="flex items-center gap-2 my-2">
                      <FaClock />
                      {+packageData.packageDays > 0 &&
                        (+packageData.packageDays > 1
                          ? packageData.packageDays + " Days"
                          : packageData.packageDays + " Day")}
                      {+packageData.packageDays > 0 &&
                        +packageData.packageNights > 0 &&
                        " - "}
                      {+packageData.packageNights > 0 &&
                        (+packageData.packageNights > 1
                          ? packageData.packageNights + " Nights"
                          : packageData.packageNights + " Night")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-4 items-center justify-center my-1">
                <label className="font-semibold" htmlFor="date">
                  Select Date:
                </label>
                <input
                  type="date"
                  min={currentDate !== "" ? currentDate : ""}
                  //   min={"2024-01-23"}
                  id="date"
                  className="w-max border rounded"
                  onChange={(e) => {
                    setBookingData({ ...bookingData, date: e.target.value });
                  }}
                />
              </div>
              {/* price */}
              <p className="flex gap-1 text-xl items-center justify-center font-semibold my-1">
                Price:
                {packageData.packageOffer ? (
                  <>
                    <span className="line-through text-gray-700">
                      ${packageData.packagePrice}
                    </span>{" "}
                    -<span>${packageData.packageDiscountPrice}</span>
                    <span className="text-xs md:text-lg ml-3 bg-[#EB662B] md:p-1 px-4 md:px-5 rounded text-white">
                      {Math.floor(
                        ((+packageData.packagePrice -
                          +packageData.packageDiscountPrice) /
                          +packageData.packagePrice) *
                          100
                      )}
                      % Off
                    </span>
                  </>
                ) : (
                  <span className="text-[#EB662B]">
                    ${packageData.packagePrice}
                  </span>
                )}
              </p>
              {/* price */}
              <div className="flex items-center border-2 rounded-full px-2 w-max gap-3">
                <button
                  className="p-2 font-semibold rounded-full bg-gray-100 hover:bg-red-500 transition duration-300"
                  onClick={() => {
                    if (bookingData.persons > 1) {
                      setBookingData({
                        ...bookingData,
                        persons: bookingData.persons - 1,
                        totalPrice: packageData.packageDiscountPrice
                          ? packageData.packageDiscountPrice *
                            (bookingData.persons - 1)
                          : packageData.packagePrice *
                            (bookingData.persons - 1),
                      });
                    }
                  }}
                >
                  -
                </button>

                <input
                  value={bookingData.persons}
                  disabled
                  type="text"
                  className="border text-center text-lg w-12 rounded-full"
                />

                <button
                  className="p-2 font-semibold rounded-full bg-gray-100 hover:bg-green-400 transition duration-300"
                  onClick={() => {
                    if (bookingData.persons < 10) {
                      setBookingData({
                        ...bookingData,
                        persons: bookingData.persons + 1,
                        totalPrice: packageData.packageDiscountPrice
                          ? packageData.packageDiscountPrice *
                            (bookingData.persons + 1)
                          : packageData.packagePrice *
                            (bookingData.persons + 1),
                      });
                    }
                  }}
                >
                  +
                </button>
              </div>

              <p className="text-xl font-semibold">
                Total Price:{" "}
                <span className="text-[#EB662B]">
                  $
                  {packageData.packageDiscountPrice
                    ? packageData.packageDiscountPrice * bookingData.persons
                    : packageData.packagePrice * bookingData.persons}
                </span>
              </p>
              <div className="my-2 max-w-[300px] gap-1">
                <p className="font-semibold">
                  Payment:
                  {!instance
                    ? " Instance not ready. You can still book the package manually."
                    : " Don't use your real card details (This is not production)."}
                </p>

                {clientToken && (
                  <DropIn
                    options={{
                      authorization: clientToken,
                      paypal: { flow: "vault" },
                    }}
                    onInstance={(instance) => setInstance(instance)}
                  />
                )}

                {/* Show normal booking button regardless of instance */}
                <button
                  className="p-2 mt-2 rounded bg-[#EB662B] text-white payment-btn disabled:optional:80 hover:opacity-95 cursor-pointer"
                  onClick={handleBookPackage}
                  disabled={loading || !currentUser?.address}
                >
                  {loading ? "Processing..." : "Book Now"}
                </button>
              </div>
              <StripePayment />
            </div>
          </div>
        </div>
      </div>
      {showMap && <Map destinationName={packageData.packageDestination} />}
    </div>
  );
};

export default Booking;
