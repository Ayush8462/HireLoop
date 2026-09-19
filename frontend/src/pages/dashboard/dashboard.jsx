import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, FileText, Briefcase, Calendar, Award } from "lucide-react";
import { logout } from "../../api/auth.js";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200">
      {/* Top Navigation */}
      <nav className="border-b border-white/10 bg-[#111827]/60 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            HireLoop
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            Microservices Edition
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <User size={18} className="text-purple-400" />
            <span>
              {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "User"}
            </span>
            <span className="text-xs uppercase bg-white/10 px-2 py-0.5 rounded text-gray-400">
              {user?.role || "student"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3.5 py-1.5 rounded-xl transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600/20 via-purple-600/20 to-blue-500/10 border border-white/10 p-8 shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.firstName || "Candidate"}! 👋
            </h1>
            <p className="text-gray-300 max-w-xl">
              Track your readiness, explore company roadmaps, book mock interviews with seniors, and request verified referrals.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Award size={24} />
            </div>
            <h3 className="font-semibold text-lg text-white mb-1">Readiness Score</h3>
            <p className="text-sm text-gray-400">
              AI-driven profile & resume readiness evaluation.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Briefcase size={24} />
            </div>
            <h3 className="font-semibold text-lg text-white mb-1">Company Roadmaps</h3>
            <p className="text-sm text-gray-400">
              Targeted preparation timelines and interview stages.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Calendar size={24} />
            </div>
            <h3 className="font-semibold text-lg text-white mb-1">Mock Interviews</h3>
            <p className="text-sm text-gray-400">
              Book 1-on-1 slots with seniors and receive structured feedback.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <FileText size={24} />
            </div>
            <h3 className="font-semibold text-lg text-white mb-1">ATS Resume Scan</h3>
            <p className="text-sm text-gray-400">
              Parse keywords and optimize your CV for product firms.
            </p>
          </div>
        </div>

        {/* Microservices Connection Status Panel */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            System Connectivity
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <div className="font-medium text-white">API Gateway</div>
                <div className="text-xs text-gray-400">Port 5000</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <div className="font-medium text-white">Auth Service</div>
                <div className="text-xs text-gray-400">Port 5001</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <div className="font-medium text-white">Core Service</div>
                <div className="text-xs text-gray-400">Port 5002</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;