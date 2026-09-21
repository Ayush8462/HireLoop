import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Code2, Mail, Lock, ArrowRight,
  ArrowLeft, Sparkles, CheckCircle2, Sun, Moon
} from "lucide-react";
import { login } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Theme state synced with Dashboard & LocalStorage
  const [dark, setDark] = useState(() => localStorage.getItem("hireloop_theme") === "dark");

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("hireloop_theme", next ? "dark" : "light");
      return next;
    });
  };

  /* ── Theme tokens exactly matching dashboard.jsx ─────────────────────────── */
  const T = {
    bg:          dark ? "#0b0f19" : "#f0f7f3",
    surface:     dark ? "#111827" : "#ffffff",
    surfaceAlt:  dark ? "#161e2e" : "#f8fafc",
    border:      dark ? "#1f2937" : "#e5e7eb",
    text:        dark ? "#f9fafb" : "#111827",
    muted:       dark ? "#9ca3af" : "#64748b",
    hover:       dark ? "#1e293b" : "#f1f5f9",
    green:       "#16a34a",
    greenLight:  dark ? "#064e3b" : "#dcfce7",
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await login(formData);

      const token = data?.data?.accessToken || data?.token;
      const user = data?.data?.user || data?.user;

      if (token) {
        loginUser(token, user);
      }

      alert("Login successful!");
      if (user?.role === "senior" || user?.role === "alumni") {
        navigate("/senior-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-200"
      style={{ background: T.bg, color: T.text }}
    >
      {/* Background Ambient Glows */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-[120px] pointer-events-none transition-opacity duration-300"
        style={{ background: dark ? "rgba(16, 185, 129, 0.15)" : "rgba(34, 197, 94, 0.18)" }}
      />
      <div
        className="absolute bottom-10 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
        style={{ background: dark ? "rgba(20, 184, 166, 0.1)" : "rgba(20, 184, 166, 0.12)" }}
      />
      <div
        className="absolute top-1/3 -left-20 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
        style={{ background: dark ? "rgba(4, 120, 87, 0.1)" : "rgba(34, 197, 94, 0.1)" }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors"
            style={{ background: T.green, boxShadow: `0 10px 15px -3px ${T.green}40` }}
          >
            <Code2 size={20} className="text-white" />
          </div>
          <div>
            <div className="font-extrabold text-lg leading-tight tracking-tight" style={{ color: T.text }}>
              HireLoop
            </div>
            <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.green }}>
              Career Platform
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={dark ? "Switch to Light mode" : "Switch to Dark mode"}
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer"
            style={{
              background: T.surface,
              borderColor: T.border,
              color: dark ? "#fbbf24" : T.muted,
            }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium transition px-3.5 py-1.5 rounded-xl border"
            style={{
              background: T.surface,
              borderColor: T.border,
              color: T.muted,
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div
            className="backdrop-blur-xl border rounded-2xl p-7 sm:p-9 relative overflow-hidden transition-colors duration-200"
            style={{
              background: T.surface,
              borderColor: T.border,
              boxShadow: dark
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                : "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
            }}
          >
            {/* Top Green Accent Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(to right, #10b981, ${T.green}, #14b8a6)` }}
            />

            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-3"
                style={{
                  background: T.greenLight,
                  color: T.green,
                  borderColor: dark ? "rgba(22, 163, 74, 0.3)" : "#bbf7d0",
                }}
              >
                <Sparkles size={13} />
                <span>Placement Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: T.text }}>
                Welcome Back
              </h1>
              <p className="text-sm mt-2" style={{ color: T.muted }}>
                Sign in to continue mock interviews, referrals & prep
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: T.muted }}>
                  Email Address
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    style={{ color: T.muted }}
                  >
                    <Mail size={17} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition"
                    style={{
                      background: T.surfaceAlt,
                      borderColor: T.border,
                      color: T.text,
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: T.muted }}>
                  Password
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    style={{ color: T.muted }}
                  >
                    <Lock size={17} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl border text-sm outline-none transition"
                    style={{
                      background: T.surfaceAlt,
                      borderColor: T.border,
                      color: T.text,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition p-0.5 cursor-pointer"
                    style={{ color: T.muted }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none" style={{ color: T.muted }}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border accent-[#16a34a]"
                    style={{ borderColor: T.border }}
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="font-medium transition hover:underline"
                  style={{ color: T.green }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: T.green,
                  boxShadow: `0 10px 15px -3px ${T.green}40`,
                }}
              >
                <span>{loading ? "Signing In..." : "Sign In to HireLoop"}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: T.border }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 uppercase font-semibold tracking-wider" style={{ background: T.surface, color: T.muted }}>
                  New to the platform?
                </span>
              </div>
            </div>

            {/* Signup Link */}
            <div className="text-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl border text-sm font-semibold transition"
                style={{
                  background: T.surfaceAlt,
                  borderColor: T.border,
                  color: T.text,
                }}
              >
                Create an Account
              </Link>
            </div>
          </div>

          {/* Bottom Security / Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs" style={{ color: T.muted }}>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} style={{ color: T.green }} />
              Verified College Network
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} style={{ color: T.green }} />
              Direct Senior Referrals
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 py-5 text-center text-xs border-t transition-colors"
        style={{ borderColor: T.border, color: T.muted }}
      >
        © 2026 HireLoop. Empowering student careers with real alumni connections.
      </footer>
    </div>
  );
}