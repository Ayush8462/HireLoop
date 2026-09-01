import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../../api/auth.js";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Call Login API here

     try {
    const { data } = await login(formData);

    alert("Login successful!");

    // Example: store JWT token if returned by your backend
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    // Navigate after successful login
    navigate("/dashboard");
  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      err.message ||
      "Login failed"
    );
  }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-10">

      {/* Background Glow */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-600/20 blur-3xl rounded-full"></div>

      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="text-gray-400 mt-2">
            Login to continue your placement journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-gray-300 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-gray-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-[#111827] border border-gray-700 text-white outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex justify-between items-center text-sm">

            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                className="accent-blue-500"
              />
              Remember Me
            </label>

            <Link
              to="/forgot-password"
              className="text-blue-400 hover:text-blue-300"
            >
              Forgot Password?
            </Link>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:scale-[1.02] transition"
          >
            Login
          </button>

        </form>

        <div className="text-center mt-6 text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}