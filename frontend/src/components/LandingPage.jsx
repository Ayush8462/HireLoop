import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Code2, Calendar, Send, FileText, Building2,
  Sparkles, CheckCircle2, ArrowRight, Target,
  GraduationCap, Briefcase, ShieldCheck,
  Sun, Moon
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

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

  return (
    <div
      className="min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-500 relative overflow-x-hidden transition-colors duration-200"
      style={{ background: T.bg, color: T.text }}
    >
      {/* Background Ambient Glows */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] rounded-full blur-[140px] pointer-events-none transition-opacity duration-300"
        style={{ background: dark ? "rgba(16, 185, 129, 0.15)" : "rgba(34, 197, 94, 0.2)" }}
      />
      <div
        className="absolute top-[45%] -left-40 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: dark ? "rgba(20, 184, 166, 0.1)" : "rgba(20, 184, 166, 0.12)" }}
      />
      <div
        className="absolute bottom-20 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: dark ? "rgba(4, 120, 87, 0.1)" : "rgba(34, 197, 94, 0.12)" }}
      />

      {/* --- HEADER --- */}
      <header
        className="backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-200"
        style={{
          background: dark ? "rgba(11, 15, 25, 0.85)" : "rgba(240, 247, 243, 0.85)",
          borderColor: T.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
              style={{ background: T.green, boxShadow: `0 10px 15px -3px ${T.green}40` }}
            >
              <Code2 size={22} className="text-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg leading-tight tracking-tight" style={{ color: T.text }}>
                HireLoop
              </div>
              <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.green }}>
                Career Acceleration
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex gap-7 items-center text-sm font-medium">
            <a href="#features" className="hover:text-emerald-600 transition-colors" style={{ color: T.muted }}>
              Features
            </a>
            <a href="#how" className="hover:text-emerald-600 transition-colors" style={{ color: T.muted }}>
              How It Works
            </a>
            <a href="#companies" className="hover:text-emerald-600 transition-colors" style={{ color: T.muted }}>
              Target Companies
            </a>

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

            <button
              className="transition-colors cursor-pointer px-3 py-1.5"
              style={{ color: T.text }}
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>

            <button
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all cursor-pointer flex items-center gap-1.5 hover:opacity-95"
              style={{ background: T.green, boxShadow: `0 10px 15px -3px ${T.green}40` }}
              onClick={() => navigate("/signup")}
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </nav>

          {/* Mobile Quick Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="w-8 h-8 rounded-lg border flex items-center justify-center"
              style={{ background: T.surface, borderColor: T.border, color: dark ? "#fbbf24" : T.muted }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              className="text-xs px-2.5 py-1.5"
              style={{ color: T.text }}
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
            <button
              className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold"
              style={{ background: T.green }}
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-22 lg:pb-28 grid lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 relative z-10"
        >
          {/* Tagline Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-6"
            style={{
              background: T.greenLight,
              borderColor: dark ? "rgba(22, 163, 74, 0.3)" : "#bbf7d0",
              color: T.green,
            }}
          >
            <Sparkles size={14} />
            <span>Smart Placement & Alumni Referral Network</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight mb-6"
            style={{ color: T.text }}
          >
            Crack Campus Placements with{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: dark
                  ? "linear-gradient(to right, #34d399, #4ade80, #5eead4)"
                  : "linear-gradient(to right, #15803d, #16a34a, #0d9488)",
              }}
            >
              Senior Referrals & Mock Interviews
            </span>
          </h1>

          <p className="text-base sm:text-lg mb-8 max-w-2xl leading-relaxed" style={{ color: T.muted }}>
            Practice 1:1 live mock interviews with verified seniors, optimize your resume with AI ATS scoring, explore company-specific interview roadmaps, and secure direct job referrals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 items-center">
            <button
              className="px-7 py-3.5 rounded-xl text-white font-semibold shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer text-sm sm:text-base"
              style={{ background: T.green, boxShadow: `0 15px 20px -3px ${T.green}40` }}
              onClick={() => navigate("/signup", { state: { role: "Student" } })}
            >
              <GraduationCap size={20} />
              <span>Join as Student</span>
              <ArrowRight size={16} />
            </button>

            <button
              className="px-6 py-3.5 rounded-xl border font-semibold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer text-sm sm:text-base"
              style={{
                background: T.surface,
                borderColor: T.border,
                color: T.text,
              }}
              onClick={() => navigate("/signup", { state: { role: "Alumni" } })}
            >
              <Briefcase size={18} style={{ color: T.green }} />
              <span>Join as Senior / Alumni</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div
            className="mt-10 pt-8 border-t flex flex-wrap items-center gap-6 text-xs font-medium"
            style={{ borderColor: T.border, color: T.muted }}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} style={{ color: T.green }} />
              Verified Company Alumni
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} style={{ color: T.green }} />
              1:1 Live Coding Rounds
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} style={{ color: T.green }} />
              100% Free for College Students
            </span>
          </div>
        </motion.div>

        {/* Hero Interactive Preview Card (Dashboard Mockup) */}
        <motion.div
          className="lg:col-span-5 relative z-10"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div
            className="relative rounded-2xl p-1 shadow-2xl transition-all"
            style={{
              background: dark
                ? "linear-gradient(to bottom right, rgba(16, 185, 129, 0.3), #1f2937, rgba(20, 184, 166, 0.2))"
                : "linear-gradient(to bottom right, rgba(22, 163, 74, 0.25), #e5e7eb, rgba(20, 184, 166, 0.2))",
            }}
          >
            <div
              className="border rounded-xl p-5 sm:p-6 text-left space-y-4"
              style={{ background: T.surface, borderColor: T.border }}
            >
              {/* Card Topbar */}
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: T.border }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-semibold ml-2" style={{ color: T.muted }}>
                    HireLoop Student Dashboard
                  </span>
                </div>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    background: T.greenLight,
                    color: T.green,
                    borderColor: dark ? "rgba(22, 163, 74, 0.3)" : "#bbf7d0",
                  }}
                >
                  Live Portal
                </span>
              </div>

              {/* Mock Dashboard Widget 1: Mock Interview */}
              <div
                className="p-3.5 rounded-xl border space-y-1.5"
                style={{ background: T.surfaceAlt, borderColor: T.border }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: T.text }}>
                    <Calendar size={15} style={{ color: T.green }} />
                    <span>Mock Interview Confirmed</span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: T.greenLight, color: T.green }}
                  >
                    TODAY, 6:30 PM
                  </span>
                </div>
                <div className="text-xs" style={{ color: T.muted }}>
                  DSA & System Design with <strong style={{ color: T.text }}>SDE 2 @ Google</strong>
                </div>
              </div>

              {/* Mock Dashboard Widget 2: ATS Scanner */}
              <div
                className="p-3.5 rounded-xl border space-y-2"
                style={{ background: T.surfaceAlt, borderColor: T.border }}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2" style={{ color: T.text }}>
                    <FileText size={15} style={{ color: "#0d9488" }} />
                    ATS Resume Score
                  </span>
                  <span className="font-extrabold text-sm" style={{ color: T.green }}>
                    88 / 100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: dark ? "#1f2937" : "#e2e8f0" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "88%",
                      background: `linear-gradient(to right, ${T.green}, #14b8a6)`,
                    }}
                  />
                </div>
                <div className="text-[11px]" style={{ color: T.muted }}>
                  Strong match for Frontend & Fullstack Intern roles
                </div>
              </div>

              {/* Mock Dashboard Widget 3: Referral */}
              <div
                className="p-3.5 rounded-xl border flex items-center justify-between"
                style={{ background: T.surfaceAlt, borderColor: T.border }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-black text-amber-500 text-xs">
                    a
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: T.text }}>
                      Amazon SDE-1 Referral
                    </div>
                    <div className="text-[10px]" style={{ color: T.muted }}>
                      Referred by Alumni • Reviewing Profile
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/15 text-amber-500 border border-amber-500/25">
                  PENDING
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- TARGET COMPANIES SECTION --- */}
      <section
        id="companies"
        className="py-14 border-y transition-colors"
        style={{
          background: dark ? "rgba(17, 24, 39, 0.4)" : "rgba(255, 255, 255, 0.6)",
          borderColor: T.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: T.green }}>
            Alumni Mentors & Curated Roadmaps for Top Companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            {[
              { name: "Google", desc: "SDE & Cloud", color: "#4285F4" },
              { name: "Microsoft", desc: "Azure & Core", color: "#00A4EF" },
              { name: "Amazon", desc: "AWS & SDE I", color: "#FF9900" },
              { name: "Flipkart", desc: "Scale & FinTech", color: "#2874f0" },
              { name: "Zomato", desc: "Quick Commerce", color: "#E23744" },
            ].map((company) => (
              <div
                key={company.name}
                className="flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all"
                style={{
                  background: T.surface,
                  borderColor: T.border,
                  boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: company.color }}
                />
                <div className="text-left">
                  <div className="text-sm font-bold leading-tight" style={{ color: T.text }}>
                    {company.name}
                  </div>
                  <div className="text-[10px]" style={{ color: T.muted }}>
                    {company.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-3"
              style={{
                background: T.greenLight,
                borderColor: dark ? "rgba(22, 163, 74, 0.3)" : "#bbf7d0",
                color: T.green,
              }}
            >
              <Sparkles size={13} />
              <span>Tailored For College Students</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: T.text }}>
              Everything You Need to Get Hired
            </h2>
            <p className="text-sm sm:text-base mt-3" style={{ color: T.muted }}>
              Designed around real campus placement requirements and verified alumni participation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "1-on-1 Mock Interviews",
                desc: "Book live interview slots with experienced alumni. Get authentic coding questions, feedback on edge cases, and actionable tips.",
                tag: "Live Scheduling",
              },
              {
                icon: Send,
                title: "Direct Job Referrals",
                desc: "Request referrals directly from verified working seniors at product companies. Track status from review to submission in real time.",
                tag: "Verified Alumni",
              },
              {
                icon: FileText,
                title: "AI ATS Resume Scanner",
                desc: "Upload your resume PDF to instantly inspect keyword matching, strengths, formatting issues, and receive a benchmark score.",
                tag: "Instant Feedback",
              },
              {
                icon: Building2,
                title: "Company Prep Roadmaps",
                desc: "Round-by-round interview guides for Google, Microsoft, Amazon, and more — covering OA topics, live coding, and behavioral rounds.",
                tag: "Curated Strategy",
              },
              {
                icon: Target,
                title: "Student Readiness Profile",
                desc: "Showcase your education, skills, and projects in a structured student profile that seniors review when deciding referrals.",
                tag: "Portfolio Builder",
              },
              {
                icon: ShieldCheck,
                title: "Verified Peer Network",
                desc: "Connect directly with alumni who recently cracked the exact company drives you are aiming for.",
                tag: "Community Driven",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="border p-6 rounded-2xl transition-all group relative overflow-hidden"
                style={{
                  background: T.surface,
                  borderColor: T.border,
                  boxShadow: dark ? "none" : "0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.02)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
                    style={{ background: T.greenLight, color: T.green }}
                  >
                    <f.icon size={22} />
                  </div>
                  <span
                    className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border"
                    style={{ background: T.surfaceAlt, borderColor: T.border, color: T.muted }}
                  >
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: T.text }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: T.muted }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section
        id="how"
        className="py-24 border-t transition-colors relative"
        style={{
          background: dark ? "rgba(17, 24, 39, 0.4)" : "rgba(240, 247, 243, 0.5)",
          borderColor: T.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: T.text }}>
              How HireLoop Works
            </h2>
            <p className="text-sm sm:text-base mt-3" style={{ color: T.muted }}>
              A clear, proven path from college student to high-paying software engineer.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Create Student Profile",
                desc: "Set up your academic info, key technical skills, and target dream companies.",
              },
              {
                step: "02",
                title: "Scan Your Resume",
                desc: "Run ATS analysis to spot missing technical keywords and improve interview shortlist chances.",
              },
              {
                step: "03",
                title: "Practice Mock Rounds",
                desc: "Book live 1:1 coding rounds with seniors who give candid, actionable feedback.",
              },
              {
                step: "04",
                title: "Request Referrals",
                desc: "Connect with verified seniors to get referred directly to open campus and off-campus roles.",
              },
            ].map((st, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="border p-6 rounded-2xl relative transition-all"
                style={{
                  background: T.surface,
                  borderColor: T.border,
                  boxShadow: dark ? "none" : "0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                <div className="text-3xl font-black mb-3 tracking-tight" style={{ color: T.green }}>
                  {st.step}
                </div>
                <h4 className="text-base font-bold mb-2" style={{ color: T.text }}>
                  {st.title}
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: T.muted }}>
                  {st.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="max-w-5xl mx-auto rounded-3xl border p-8 sm:p-14 text-center relative shadow-2xl transition-all"
          style={{
            background: dark
              ? "linear-gradient(to bottom right, rgba(6, 78, 59, 0.4), #111827, #161e2e)"
              : "linear-gradient(to bottom right, #dcfce7, #f0fdf4, #ffffff)",
            borderColor: dark ? "rgba(22, 163, 74, 0.3)" : "#bbf7d0",
          }}
        >
          <div
            className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(22, 163, 74, 0.2)" }}
          />
          <div
            className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(20, 184, 166, 0.2)" }}
          />

          <div className="relative z-10">
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5" style={{ color: T.text }}>
              Ready to Accelerate Your Placement?
            </h3>
            <p
              className="text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed"
              style={{ color: dark ? "#d1d5db" : "#475569" }}
            >
              Join students and alumni already using HireLoop to prepare smarter, practice realistic mock interviews, and land referrals.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="px-8 py-4 rounded-xl text-white font-semibold shadow-xl hover:scale-[1.02] transition cursor-pointer flex items-center gap-2"
                style={{ background: T.green, boxShadow: `0 15px 20px -3px ${T.green}40` }}
                onClick={() => navigate("/signup")}
              >
                <span>Create Free Student Account</span>
                <ArrowRight size={17} />
              </button>

              <button
                className="px-6 py-4 rounded-xl border font-semibold transition cursor-pointer"
                style={{
                  background: T.surface,
                  borderColor: T.border,
                  color: T.text,
                }}
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer
        className="border-t py-12 text-xs transition-colors"
        style={{
          background: T.surface,
          borderColor: T.border,
          color: T.muted,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.green }}>
              <Code2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: T.text }}>
              HireLoop
            </span>
          </div>

          <div className="text-center sm:text-right">
            © 2026 HireLoop. All rights reserved. Connecting students with alumni career opportunities.
          </div>
        </div>
      </footer>
    </div>
  );
}