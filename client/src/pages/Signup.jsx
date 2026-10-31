import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import loginImage from "../assets/images/login.png";
import { toast } from "react-toastify";
const API = import.meta.env.VITE_API_URL;

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check password strength when the password field changes
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  // Password strength validation
  const checkPasswordStrength = (password) => {
    // Weak password condition: password is less than 6 characters
    if (password.length < 6) {
      setPasswordStrength("Weak");
    }
    // Medium strength password condition: must contain at least one number and one letter
    else if (
      password.length >= 6 &&
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)
    ) {
      setPasswordStrength("Medium");
    }
    // Strong password condition: at least one lowercase letter, one uppercase letter, one number, and one special character
    else if (
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
        password
      )
    ) {
      setPasswordStrength("Strong");
    } else {
      setPasswordStrength("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 11) {
      toast.error("Phone number must be 11 digits long.");
      return;
    }
    try {
      const res = await axios.post(`${API}/api/auth/signup`, formData);
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        navigate("/login");
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className=" w-full mx-auto h-screen flex justify-center items-center bg-[#FFF1DA]">
      <div className="w-full min-h-screen flex items-center justify-center bg-[#FFF1DA]">
        <div className="w-[90%] bg-white md:w-[60%] mx-auto flex flex-col  rounded-md gap-6">
          {/* Centered Heading */}
          <h1 className="text-center text-lg mt-6 font-medium md:text-3xl md:font-bold text-gray-800">
            Signup into <span className="text-[#FF7D68]">Trevo</span>
          </h1>

          {/* Form + Image Box */}
          <div className="flex flex-col md:flex-row gap-5  h-auto md:h-[600px] rounded-md items-center justify-center p-4">
            <div className="w-full md:w-1/2 flex justify-center">
              <img src={loginImage} alt="Login" className="max-h-[300px]" />
            </div>

            <form onSubmit={handleSubmit} className="w-full md:w-1/2 px-4">
              <div>
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="Your Username"
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="Your Email"
                />
              </div>
              <div className="mt-4">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="Your Password"
                />
                {/* Password Strength Indicator */}
                {passwordStrength && (
                  <p
                    className={`mt-2 text-sm ${
                      passwordStrength === "Weak"
                        ? "text-red-500"
                        : passwordStrength === "Medium"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {passwordStrength} Password
                  </p>
                )}
              </div>
              <div className="mt-4">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="Your Address"
                />
              </div>
              <div className="mt-4">
                <label>Phone</label>
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="Your Phone"
                />
              </div>
              <button className="w-full bg-[#EB662B] text-white p-3 mt-4 rounded-md">
                Signup
              </button>
              <p className="my-4 text-center">
                Already have an account?{" "}
                <span className="text-[#EB662B]">
                  <Link to="/login">Login</Link>
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
