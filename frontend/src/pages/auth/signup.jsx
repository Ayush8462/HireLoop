import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { signup } from "../../api/auth";

export default function Signup() {
  const location = useLocation();
  const defaultRole = location.state?.role || "student";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Button clicked");

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Call your backend API here
  
    try{
      const {data} = await signup(formData);

      alert("Account created successfully!");
      navigate("/login");
    }catch(err){
      console.log(err);
      alert(err.response?.data?.message || err.message|| "An error occurred during signup.");
    }

    
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-10">
      {/* Background Glow */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-600/20 blur-3xl rounded-full"></div>

      <div className="relative w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Create Account
          </h1>

          <p className="text-gray-400 mt-2">
            Join HireLoop and start your placement journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-gray-300 mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-gray-700 text-white outline-none focus:border-blue-500"
            />
          </div>

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
                            placeholder="Enter password"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-300 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-[#111827] border border-gray-700 text-white outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-300 mb-3">
              Select Role
            </label>

            <div className="grid grid-cols-2 gap-4">

              <label
                className={`cursor-pointer rounded-xl border p-4 text-center transition ${
                  formData.role === "student"
                    ? "border-blue-500 bg-blue-500/20 text-blue-400"
                    : "border-gray-700 bg-[#111827] text-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === "student"}
                  onChange={handleChange}
                  className="hidden"
                />

                🎓 Student
              </label>

              <label
                className={`cursor-pointer rounded-xl border p-4 text-center transition ${
                  formData.role === "alumni"
                    ? "border-purple-500 bg-purple-500/20 text-purple-400"
                    : "border-gray-700 bg-[#111827] text-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="alumni"
                  checked={formData.role === "alumni"}
                  onChange={handleChange}
                  className="hidden"
                />

                👨‍💼 Alumni
              </label>

            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:scale-[1.02] transition"
          >
            Create Account
          </button>
        </form>

        <div className="text-center mt-6 text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}