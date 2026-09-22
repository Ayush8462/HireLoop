/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Calendar, ChevronRight, Clock, Code2,
  FileText, Moon, Plus, Search,
  Sun, User, X, CheckCircle2, AlertCircle, Upload,
  LogOut, Building2, LayoutDashboard,
  Target, Menu, Send, ExternalLink,
  ChevronLeft, Sparkles, Info, Pencil,
  Download, Eye, FileCheck, FileUp, RefreshCw, Video,
  Mail, Phone, GraduationCap, BookOpen, Award, Check
} from "lucide-react";
import { logout } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyProfile, updateMyProfile, createProfile, uploadProfileResume, getResumeViewUrl, getResumeDownloadUrl } from "../../api/profile.js";
import { getAllCompanies, getCompanyRoadmaps } from "../../api/company.js";
import { getAvailableSlots, bookInterview, getStudentHistory, cancelInterview } from "../../api/interview.js";
import { getMySentReferrals, requestReferral, cancelReferral } from "../../api/referral.js";
import { uploadAndScoreResume, scoreResumeUrl } from "../../api/ats.js";
import NotificationBell from "../../components/notifications/NotificationBell.jsx";

/* ─────────────────────────── Default Fallback Companies ────────────────────── */
const DEFAULT_COMPANIES = [
  {
    _id: "comp_google",
    name: "Google",
    industry: "Internet & Technology",
    headquarters: "Mountain View, CA / Bangalore",
    website: "https://careers.google.com",
    description: "Global technology leader in search, cloud computing, software, and hardware.",
    rolesHiring: ["SDE Intern", "Software Engineer - Campus", "Data Engineer"],
  },
  {
    _id: "comp_microsoft",
    name: "Microsoft",
    industry: "Enterprise Software & Cloud",
    headquarters: "Redmond, WA / Hyderabad",
    website: "https://careers.microsoft.com",
    description: "Empowering every person and organization on the planet to achieve more through Azure and software solutions.",
    rolesHiring: ["SDE Intern", "Support Engineer", "Cloud Solutions Architect"],
  },
  {
    _id: "comp_amazon",
    name: "Amazon",
    industry: "E-Commerce & Cloud Computing",
    headquarters: "Seattle, WA / Bangalore",
    website: "https://amazon.jobs",
    description: "Earth's most customer-centric company, leading e-commerce, cloud infrastructure (AWS), and digital streaming.",
    rolesHiring: ["Software Development Engineer I", "Operations Intern", "Data Analyst"],
  },
  {
    _id: "comp_flipkart",
    name: "Flipkart",
    industry: "E-Commerce & Retail",
    headquarters: "Bangalore, India",
    website: "https://www.flipkartcareers.com",
    description: "India's homegrown e-commerce marketplace driving innovation in supply chain, payments, and consumer tech.",
    rolesHiring: ["Software Engineer 1", "Product Analyst", "UI Engineer"],
  },
  {
    _id: "comp_zomato",
    name: "Zomato",
    industry: "Food Delivery & Quick Commerce",
    headquarters: "Gurgaon, India",
    website: "https://www.zomato.com/careers",
    description: "Connecting millions of customers with food partners and pioneering quick commerce via Blinkit.",
    rolesHiring: ["Full Stack Intern", "Backend Engineer", "Data Scientist"],
  },
];

/* ─────────────────────────── Default Roadmaps ──────────────────────────────── */
const DEFAULT_ROADMAPS = {
  Google: {
    title: "Google SDE Interview Roadmap",
    description: "Proven 4-stage preparation guide for Google campus and off-campus SWE roles.",
    stages: [
      {
        order: 1,
        title: "Stage 1: Online Coding Assessment (OA)",
        description: "90 minutes timed assessment on Google's testing platform.",
        topics: [
          "Arrays, Two Pointers & Sliding Window (Medium to Hard)",
          "Binary Search on Answer Range",
          "Tree Traversals & Lowest Common Ancestor",
          "Graph BFS & DFS algorithms",
        ],
        resources: [
          { title: "LeetCode Google Question Bank", url: "https://leetcode.com/company/google" },
          { title: "Google OA Practice Guide", url: "https://neetcode.io" },
        ],
      },
      {
        order: 2,
        title: "Stage 2: Technical Interview 1 & 2 (DSA Deep Dive)",
        description: "45-minute live pair coding rounds with Google engineers focusing on clean, bug-free implementation.",
        topics: [
          "Dynamic Programming (1D, 2D, DP on Trees)",
          "Graph Shortest Path (Dijkstra, Bellman-Ford)",
          "Trie & Prefix Matching",
          "Time & Space Complexity analysis with edge case justification",
        ],
        resources: [
          { title: "Striver's SDE Sheet", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" },
        ],
      },
      {
        order: 3,
        title: "Stage 3: System Design / Problem Solving (For Senior/Mid-tier)",
        description: "Architecting scalable backend systems or object-oriented design.",
        topics: [
          "Scalability, Caching, and Load Balancing",
          "Database Sharding and Indexing",
          "Designing URL Shortener / Rate Limiter",
        ],
        resources: [
          { title: "Grokking System Design", url: "https://github.com/donnemartin/system-design-primer" },
        ],
      },
      {
        order: 4,
        title: "Stage 4: Googleyness & Leadership",
        description: "Cultural fit, teamwork ethics, intellectual humility, and navigating ambiguity.",
        topics: [
          "STAR method behavioral answers",
          "Handling conflict and failure in team projects",
          "Open-source contributions and ownership",
        ],
        resources: [
          { title: "Googleyness Interview Principles", url: "https://careers.google.com/how-we-hire/" },
        ],
      },
    ],
  },
  Microsoft: {
    title: "Microsoft SDE Preparation Roadmap",
    description: "Comprehensive multi-round roadmap for Microsoft Engage, Campus Drives & Off-Campus.",
    stages: [
      {
        order: 1,
        title: "Round 1: Codility / Mettl Online Assessment",
        description: "2-3 coding problems assessing data structures and speed.",
        topics: [
          "String manipulation & parsing",
          "Linked List cycles & reversals",
          "Hash Maps & Counting frequencies",
        ],
        resources: [{ title: "Codility Lesson Challenges", url: "https://app.codility.com/programmers/lessons/" }],
      },
      {
        order: 2,
        title: "Round 2 & 3: Technical Problem Solving",
        description: "Live coding interviews testing problem-solving clarity and code modularity.",
        topics: [
          "Binary Trees & BST validation",
          "Recursion & Backtracking (Subsets, Permutations)",
          "Stack & Queue applications (Next Greater Element)",
        ],
        resources: [{ title: "Microsoft Top Interview Questions", url: "https://leetcode.com/company/microsoft" }],
      },
      {
        order: 3,
        title: "Round 4: Technical & HR (AA - As Appropriate Round)",
        description: "Core computer science fundamentals (OS, DBMS, CN) and resume project deep-dive.",
        topics: [
          "Operating Systems: Threads, Deadlocks, Virtual Memory",
          "DBMS: ACID properties, Normalization, SQL Queries",
          "Computer Networks: TCP/IP vs UDP, DNS, HTTPS Handshake",
        ],
        resources: [{ title: "CS Core Fundamentals Guide", url: "https://whimsical.com" }],
      },
    ],
  },
  Amazon: {
    title: "Amazon SDE 1 & Internship Roadmap",
    description: "Complete guide tailored around Amazon Leadership Principles and coding standards.",
    stages: [
      {
        order: 1,
        title: "Round 1: Online Assessment (OA 1 & OA 2)",
        description: "Coding problems + Work Style Simulation (Leadership Principles).",
        topics: [
          "Heap / Priority Queue (K top elements)",
          "Breadth-First Search on Matrices (Rotting Oranges)",
          "Amazon 16 Leadership Principles questionnaire",
        ],
        resources: [{ title: "Amazon OA Guide", url: "https://leetcode.com/discuss/interview-question" }],
      },
      {
        order: 2,
        title: "Round 2 & 3: Virtual Onsite Coding Rounds",
        description: "20 mins Leadership Principles + 30 mins live coding.",
        topics: [
          "Design in-memory cache with eviction policy (LRU Cache)",
          "Trees, Dynamic Programming on Grid",
          "Time/Space tradeoff justification",
        ],
        resources: [{ title: "Amazon Top 50 LeetCode", url: "https://leetcode.com/company/amazon" }],
      },
      {
        order: 3,
        title: "Round 4: Bar Raiser Round",
        description: "Rigorous behavioral assessment alongside difficult problem solving.",
        topics: [
          "Deep dive into final year projects and production challenges",
          "Customer Obsession and Bias for Action real-life examples",
        ],
        resources: [{ title: "Amazon Leadership Principles Breakdown", url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles" }],
      },
    ],
  },
};

/* ─────────────────────────── Logos ────────────────────────────────────────── */
const CompanyLogo = ({ name = "" }) => {
  const n = name.toLowerCase();
  if (n.includes("google")) {
    return (
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
    );
  }
  if (n.includes("microsoft")) {
    return (
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/>
          <path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/>
        </svg>
      </div>
    );
  }
  if (n.includes("amazon")) {
    return (
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FF9900", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>a</span>
      </div>
    );
  }
  if (n.includes("flipkart")) {
    return (
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#2874f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: "#ffe500", fontWeight: 900, fontSize: 15, fontStyle: "italic" }}>F</span>
      </div>
    );
  }
  if (n.includes("zomato")) {
    return (
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#cb202d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>Z</span>
      </div>
    );
  }
  const bgs = ["#7c3aed", "#2563eb", "#0891b2", "#d97706", "#db2777"];
  const bg = bgs[name.charCodeAt(0) % bgs.length] || "#16a34a";
  return (
    <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{name[0]?.toUpperCase() || "C"}</span>
    </div>
  );
};

/* ─────────────────────────── Toast Notification ───────────────────────────── */
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px", borderRadius: 14,
      background: type === "success" ? "#dcfce7" : "#ffe4e6",
      border: `1px solid ${type === "success" ? "#86efac" : "#fecdd3"}`,
      color: type === "success" ? "#15803d" : "#e11d48",
      boxShadow: "0 8px 24px rgba(0,0,0,.15)", fontSize: 13, fontWeight: 600,
    }}>
      {type === "success" ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
      <span>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", marginLeft: 6, opacity: 0.7 }}>
        <X size={14}/>
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const { logoutUser, token } = useAuth();
  const fileRef = useRef(null);
  const profileResumeInputRef = useRef(null);
  const referralResumeInputRef = useRef(null);

  // Appearance & navigation state
  const [dark, setDark] = useState(() => localStorage.getItem("hireloop_theme") === "dark");
  const [sideOpen, setSideOpen] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  // Core Data state
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  // ATS state
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);

  // Resume Modal & Upload state
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeModalUrl, setResumeModalUrl] = useState("");
  const [resumeModalTitle, setResumeModalTitle] = useState("Resume");
  const [resumeUploading, setResumeUploading] = useState(false);

  const openResumeModal = (url, title = "Resume Preview") => {
    if (!url) return;
    setResumeModalUrl(url);
    setResumeModalTitle(title);
    setResumeModalOpen(true);
  };

  // Profile form state
  const [pForm, setPForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    bio: "",
    skillInput: "",
    skills: [],
    resumeUrl: "",
    resumeFileName: "",
    atsScore: null,
  });
  const [pSaving, setPSaving] = useState(false);

  // Booking Modal
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Referral Modal
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralForm, setReferralForm] = useState({
    seniorId: "",
    companyId: "",
    jobTitle: "",
    jobUrl: "",
    message: "",
    resumeUrl: "",
    resumeFileName: "",
  });
  const [referralSubmitting, setReferralSubmitting] = useState(false);

  const toast$ = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4500);
  };

  // Load all initial data
  const fetchData = async () => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      if (u) {
        if (u.role === "senior" || u.role === "alumni") {
          navigate("/senior-dashboard", { replace: true });
          return;
        }
        setUser(u);
        setPForm((f) => ({
          ...f,
          firstName: f.firstName || u.firstName || "",
          lastName: f.lastName || u.lastName || "",
        }));
      }
    } catch { /* ignore */ }

    // 1. Fetch Profile
    try {
      const r = await getMyProfile();
      const p = r.data?.data;
      if (p) {
        setProfile(p);
        setPForm({
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          phone: p.phone || "",
          college: p.college || "",
          degree: p.degree || "",
          branch: p.branch || "",
          graduationYear: p.graduationYear ? String(p.graduationYear) : "",
          bio: p.bio || "",
          skillInput: "",
          skills: p.skills || [],
          resumeUrl: p.resumeUrl || "",
          resumeFileName: p.resumeFileName || "",
          atsScore: p.atsScore || null,
        });
        if (p.resumeUrl) {
          setReferralForm((rf) => ({
            ...rf,
            resumeUrl: p.resumeUrl,
            resumeFileName: p.resumeFileName || "Student_Resume.pdf",
          }));
        }
        if (p.atsScore) {
          setAtsResult((prev) => prev || {
            score: p.atsScore,
            fileName: p.resumeFileName || "Student_Resume.pdf",
            fileUrl: p.resumeUrl,
            level: p.atsScore >= 80 ? "Top Tier Readiness" : p.atsScore >= 60 ? "Interview Ready" : "Needs Revision",
          });
        }
        setIsEditingProfile(false);
      } else {
        setIsEditingProfile(true);
      }
    } catch {
      setIsEditingProfile(true);
    }

    // 2. Fetch Available Slots
    try {
      const r = await getAvailableSlots();
      const s = r.data?.data?.items || r.data?.data || [];
      setSlots(Array.isArray(s) ? s : []);
    } catch { /* ignore */ }

    // 3. Fetch Student Bookings
    try {
      const r = await getStudentHistory();
      const b = r.data?.data?.items || r.data?.data || [];
      setBookings(Array.isArray(b) ? b : []);
    } catch { /* ignore */ }

    // 4. Fetch Sent Referrals
    try {
      const r = await getMySentReferrals();
      const ref = r.data?.data?.items || r.data?.data || [];
      setReferrals(Array.isArray(ref) ? ref : []);
    } catch { /* ignore */ }

    // 5. Fetch Companies
    try {
      const r = await getAllCompanies();
      const c = r.data?.data?.items || r.data?.data || [];
      if (Array.isArray(c) && c.length > 0) {
        setCompanies(c);
      } else {
        setCompanies(DEFAULT_COMPANIES);
      }
    } catch {
      setCompanies(DEFAULT_COMPANIES);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    logoutUser();
    navigate("/login", { replace: true });
  };

  // ATS Resume Upload & Scan (Standalone scanner - does NOT upload to Cloudinary)
  const handleResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast$("Please upload a PDF file only", "error");
      return;
    }
    setAtsLoading(true);
    const localPreviewUrl = URL.createObjectURL(file);
    try {
      const r = await uploadAndScoreResume(file);
      if (r.data?.success) {
        setAtsResult({
          ...r.data.data,
          fileName: file.name,
          fileUrl: localPreviewUrl,
        });
        toast$("Resume analyzed and scored!", "success");
        setTab("ats");
      }
    } catch (err) {
      toast$(err.response?.data?.message || "Failed to analyze resume", "error");
    } finally {
      setAtsLoading(false);
      if (e.target) e.target.value = "";
    }
  };

  // Upload Resume to Cloudinary via Profile Service
  const handleUploadProfileResume = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast$("Please upload a PDF file only", "error");
      return;
    }
    setResumeUploading(true);
    // Instant optimistic feedback: immediately display selected file name
    setPForm((f) => ({
      ...f,
      resumeFileName: file.name,
    }));
    try {
      const res = await uploadProfileResume(file);
      if (res.data?.success) {
        const data = res.data.data;
        if (data.profile) {
          setProfile(data.profile);
        }
        setPForm((f) => ({
          ...f,
          resumeUrl: data.resumeUrl,
          resumeFileName: data.resumeFileName || file.name,
          atsScore: data.atsScore,
        }));
        setReferralForm((rf) => ({
          ...rf,
          resumeUrl: data.resumeUrl,
          resumeFileName: data.resumeFileName || file.name,
        }));
        toast$("Resume uploaded to Cloudinary successfully!", "success");
        if (data.atsScore) {
          setAtsResult({
            score: data.atsScore,
            fileName: data.resumeFileName || file.name,
            fileUrl: data.resumeUrl,
            level: data.atsScore >= 80 ? "Top Tier Readiness" : data.atsScore >= 60 ? "Interview Ready" : "Needs Revision",
          });
        }
      }
    } catch (err) {
      toast$(err.response?.data?.message || "Failed to upload resume", "error");
    } finally {
      setResumeUploading(false);
      if (profileResumeInputRef.current) {
        profileResumeInputRef.current.value = "";
      }
      if (referralResumeInputRef.current) {
        referralResumeInputRef.current.value = "";
      }
    }
  };

  // Score Resume from profile URL
  const handleScoreProfileResume = async () => {
    const targetUrl = profile?.resumeUrl || pForm.resumeUrl;
    if (!targetUrl) {
      toast$("Please upload a resume first", "error");
      return;
    }
    setAtsLoading(true);
    try {
      const r = await scoreResumeUrl(targetUrl);
      if (r.data?.success) {
        setAtsResult({
          ...r.data.data,
          fileName: profile?.resumeFileName || pForm.resumeFileName || "Profile_Resume.pdf",
          fileUrl: targetUrl,
        });
        toast$("Profile resume analyzed successfully!", "success");
        setTab("ats");
      }
    } catch (err) {
      toast$(err.response?.data?.message || "Failed to score profile resume", "error");
    } finally {
      setAtsLoading(false);
    }
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setPSaving(true);
    try {
      const payload = {
        firstName: pForm.firstName,
        lastName: pForm.lastName,
        phone: pForm.phone,
        college: pForm.college,
        degree: pForm.degree,
        branch: pForm.branch,
        graduationYear: pForm.graduationYear ? Number(pForm.graduationYear) : undefined,
        bio: pForm.bio,
        skills: pForm.skills,
        resumeUrl: pForm.resumeUrl || profile?.resumeUrl || undefined,
        resumeFileName: pForm.resumeFileName || profile?.resumeFileName || undefined,
        atsScore: pForm.atsScore || profile?.atsScore || undefined,
      };
      let r;
      if (profile) {
        r = await updateMyProfile(payload);
      } else {
        try {
          r = await createProfile({ ...payload, role: "STUDENT" });
        } catch (createErr) {
          if (createErr.response?.status === 409) {
            r = await updateMyProfile(payload);
          } else {
            throw createErr;
          }
        }
      }
      if (r.data?.success || r.data?.data) {
        const updated = r.data?.data || r.data;
        setProfile(updated);
        setPForm({
          firstName: updated.firstName || "",
          lastName: updated.lastName || "",
          phone: updated.phone || "",
          college: updated.college || "",
          degree: updated.degree || "",
          branch: updated.branch || "",
          graduationYear: updated.graduationYear ? String(updated.graduationYear) : "",
          bio: updated.bio || "",
          skillInput: "",
          skills: updated.skills || [],
          resumeUrl: updated.resumeUrl || "",
          resumeFileName: updated.resumeFileName || "",
          atsScore: updated.atsScore || null,
        });
        setIsEditingProfile(false);
        toast$("Profile saved successfully!", "success");
      }
    } catch (err) {
      toast$(err.response?.data?.message || err.response?.data?.error?.message || "Failed to save profile", "error");
    } finally {
      setPSaving(false);
    }
  };

  const handleCancelEditProfile = () => {
    if (profile) {
      setPForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        college: profile.college || "",
        degree: profile.degree || "",
        branch: profile.branch || "",
        graduationYear: profile.graduationYear ? String(profile.graduationYear) : "",
        bio: profile.bio || "",
        skillInput: "",
        skills: profile.skills || [],
        resumeUrl: profile.resumeUrl || "",
        resumeFileName: profile.resumeFileName || "",
        atsScore: profile.atsScore || null,
      });
      setIsEditingProfile(false);
    }
  };

  // Confirm Mock Interview Booking
  const handleConfirmBooking = async () => {
    if (!bookingSlot) return;
    setBookingLoading(true);
    try {
      const slotId = bookingSlot._id || bookingSlot.id;
      await bookInterview(slotId, bookingNotes);
      toast$("Mock interview booked successfully!", "success");
      setBookingSlot(null);
      setBookingNotes("");
      fetchData();
    } catch (err) {
      toast$(err.response?.data?.message || err.response?.data?.error?.message || "Failed to book interview", "error");
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this mock interview?")) return;
    try {
      await cancelInterview(bookingId);
      toast$("Interview booking cancelled", "success");
      fetchData();
    } catch (err) {
      toast$(err.response?.data?.message || "Failed to cancel booking", "error");
    }
  };

  // Submit Referral Request
  const handleSubmitReferral = async (e) => {
    e.preventDefault();
    if (!referralForm.seniorId || !referralForm.companyId || !referralForm.jobTitle) {
      toast$("Please complete all required fields", "error");
      return;
    }
    setReferralSubmitting(true);
    try {
      await requestReferral({
        seniorId: referralForm.seniorId,
        companyId: referralForm.companyId,
        jobTitle: referralForm.jobTitle,
        jobUrl: referralForm.jobUrl || undefined,
        message: referralForm.message || undefined,
        resumeUrl: referralForm.resumeUrl || profile?.resumeUrl || undefined,
        resumeFileName: referralForm.resumeFileName || profile?.resumeFileName || undefined,
      });
      toast$("Referral request sent successfully!", "success");
      setReferralModalOpen(false);
      setReferralForm({
        seniorId: "",
        companyId: "",
        jobTitle: "",
        jobUrl: "",
        message: "",
        resumeUrl: profile?.resumeUrl || "",
        resumeFileName: profile?.resumeFileName || "",
      });
      fetchData();
    } catch (err) {
      toast$(err.response?.data?.message || err.response?.data?.error?.message || "Failed to submit referral request", "error");
    } finally {
      setReferralSubmitting(false);
    }
  };

  // Cancel Referral Request
  const handleCancelReferral = async (refId) => {
    if (!window.confirm("Cancel this pending referral request?")) return;
    try {
      await cancelReferral(refId);
      toast$("Referral request cancelled", "success");
      fetchData();
    } catch (err) {
      toast$(err.response?.data?.message || "Failed to cancel referral", "error");
    }
  };

  // Select company for roadmap
  const handleSelectCompany = async (comp) => {
    setSelectedCompany(comp);
    setTab("roadmaps");
    setLoadingRoadmap(true);
    try {
      const compId = comp._id || comp.id;
      const r = await getCompanyRoadmaps(compId);
      const data = r.data?.data || r.data;
      if (data && (data.stages?.length > 0 || data.title)) {
        setRoadmapData(data);
      } else {
        setRoadmapData(DEFAULT_ROADMAPS[comp.name] || null);
      }
    } catch {
      setRoadmapData(DEFAULT_ROADMAPS[comp.name] || null);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  /* ── Theme tokens ───────────────────────────────────────────────────────── */
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

  const name = profile?.firstName || user?.firstName || "Student";
  const initials = `${(profile?.firstName || user?.firstName || "S")[0]}${(profile?.lastName || user?.lastName || "D")[0]}`.toUpperCase();
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  // Calculate student metrics
  const profileFields = [profile?.firstName, profile?.college, profile?.degree, profile?.branch, profile?.bio, profile?.skills?.length];
  const profilePct = profile ? Math.min(100, Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)) : 25;
  const activeBookingsCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingReferralsCount = referrals.filter((r) => r.status === "PENDING").length;

  // Track today's referral quota (max 5)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayReferralsCount = referrals.filter((r) => new Date(r.createdAt || r.updatedAt) >= today).length;

  // Extract unique seniors from available slots for referral selection
  const activeSeniors = [];
  const seenSeniorIds = new Set();
  slots.forEach((s) => {
    if (s.seniorId && s.seniorId._id && !seenSeniorIds.has(s.seniorId._id)) {
      seenSeniorIds.add(s.seniorId._id);
      activeSeniors.push(s.seniorId);
    }
  });

  /* ── Student Sidebar Navigation ─────────────────────────────────────────── */
  const NAV = [
    { id: "dashboard",  label: "Dashboard",       Icon: LayoutDashboard },
    { id: "profile",    label: "My Profile",      Icon: User },
    { id: "interviews", label: "Mock Interviews", Icon: Calendar, badge: activeBookingsCount || undefined },
    { id: "referrals",  label: "Job Referrals",   Icon: Send, badge: pendingReferralsCount || undefined },
    { id: "roadmaps",   label: "Companies & Prep",Icon: Building2 },
    { id: "ats",        label: "ATS Resume Scan", Icon: FileText },
  ];

  /* ─────────────────────────── Render Helpers ────────────────────────────── */

  const renderSidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Brand Header */}
      <div style={{ padding: "20px 18px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: T.green, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Code2 size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.text, lineHeight: 1.2 }}>HireLoop</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: "0.06em", textTransform: "uppercase" }}>Student Portal</div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, padding: "4px 10px 8px" }}>
          Student Menu
        </div>
        {NAV.map(({ id, label, Icon, badge }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => { setTab(id); setSideOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", borderRadius: 10,
                background: active ? T.greenLight : "transparent",
                color: active ? T.green : T.muted,
                fontWeight: active ? 700 : 500, fontSize: 13.5,
                border: "none", cursor: "pointer", marginBottom: 4, transition: "all .15s",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={17} />
                {label}
              </span>
              {badge !== undefined && (
                <span style={{ background: T.green, color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "1px 7px", borderRadius: 999 }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Student Profile Footer */}
      <div style={{ padding: "14px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile?.firstName || user?.firstName || "Student"} {profile?.lastName || user?.lastName || ""}
            </div>
            <div style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Student Candidate</div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 4 }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  /* 1. Dashboard View */
  const renderDashboardView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero Card */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "24px 26px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>{greet},</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.text, display: "flex", alignItems: "center", gap: 10 }}>
            {name}! <span style={{ color: T.green }}>🎓</span>
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
            Prepare with verified seniors, get company referrals, and track your placement readiness.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setTab("interviews")}
            style={{ background: T.green, color: "#fff", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <Calendar size={15} /> Book Mock Interview
          </button>
          <button
            onClick={() => setReferralModalOpen(true)}
            style={{ background: T.hover, border: `1px solid ${T.border}`, color: T.text, borderRadius: 12, padding: "10px 18px", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <Send size={15} color={T.green} /> Request Referral
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Open Mock Slots</span>
            <div style={{ width: 34, height: 34, background: "#dcfce7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><Calendar size={16} color="#16a34a"/></div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.text, marginTop: 8 }}>{slots.length}</div>
          <div style={{ fontSize: 11.5, color: T.green, fontWeight: 600, marginTop: 4 }}>Available to book right now</div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Scheduled Interviews</span>
            <div style={{ width: 34, height: 34, background: "#dbeafe", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><Clock size={16} color="#2563eb"/></div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.text, marginTop: 8 }}>{activeBookingsCount}</div>
          <div style={{ fontSize: 11.5, color: "#2563eb", fontWeight: 600, marginTop: 4 }}>Upcoming sessions with seniors</div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Sent Referrals</span>
            <div style={{ width: 34, height: 34, background: "#fef3c7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><Send size={16} color="#d97706"/></div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.text, marginTop: 8 }}>{referrals.length}</div>
          <div style={{ fontSize: 11.5, color: "#d97706", fontWeight: 600, marginTop: 4 }}>
            {todayReferralsCount} / 5 daily quota used today
          </div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Resume ATS Score</span>
            <div style={{ width: 34, height: 34, background: "#ede9fe", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={16} color="#7c3aed"/></div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.text, marginTop: 8 }}>
            {atsResult ? `${atsResult.score}/100` : "0"}
          </div>
          <div style={{ fontSize: 11.5, color: "#7c3aed", fontWeight: 600, marginTop: 4 }}>
            {atsResult?.level || "Placement Ready"}
          </div>
        </div>
      </div>

      {/* Placement Resume Card */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={22} color={T.green} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Placement Resume</span>
                {profile?.resumeUrl ? (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#dcfce7", color: "#166534" }}>
                    Active & Stored in Cloud
                  </span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#fef3c7", color: "#b45309" }}>
                    Not Uploaded
                  </span>
                )}
                {profile?.atsScore && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#ede9fe", color: "#6d28d9" }}>
                    ATS: {profile.atsScore}/100
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>
                {profile?.resumeUrl
                  ? `File: ${profile.resumeFileName || "Student_Resume.pdf"} • Attached to outgoing referrals`
                  : "Upload your PDF resume in My Profile to request referrals and get instant ATS readiness scoring."}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {profile?.resumeUrl ? (
              <>
                <button
                  onClick={() => openResumeModal(profile.resumeUrl, profile.resumeFileName)}
                  style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, borderRadius: 10, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                >
                  <Eye size={14} color={T.green} /> View Resume
                </button>
                <a
                  href={getResumeDownloadUrl(profile.resumeUrl, profile.resumeFileName || "Resume.pdf")}
                  download={profile.resumeFileName || "Resume.pdf"}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, borderRadius: 10, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", textDecoration: "none" }}
                >
                  <Download size={14} color="#2563eb" /> Download
                </a>
                <button
                  onClick={handleScoreProfileResume}
                  disabled={atsLoading}
                  style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, borderRadius: 10, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                >
                  <Sparkles size={14} color="#7c3aed" /> Score on ATS
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setTab("profile");
                  setIsEditingProfile(true);
                }}
                style={{ background: T.green, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              >
                <User size={15} /> Upload in My Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Left: Upcoming Mock Interviews & Referrals */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Upcoming Interviews Card */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={16} color={T.green} />
                <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Upcoming Mock Interviews</span>
              </div>
              <button
                onClick={() => setTab("interviews")}
                style={{ background: "none", border: "none", color: T.green, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
              >
                View all <ChevronRight size={13} />
              </button>
            </div>

            {bookings.filter((b) => b.status === "CONFIRMED").length === 0 ? (
              <div style={{ textAlign: "center", padding: "26px 12px", background: T.surfaceAlt, borderRadius: 12 }}>
                <Clock size={28} color={T.muted} style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>No upcoming mock interviews</div>
                <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3 }}>Book an available session with an alumni mentor.</div>
                <button
                  onClick={() => setTab("interviews")}
                  style={{ marginTop: 12, background: T.green, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  Browse Senior Slots
                </button>
              </div>
            ) : (
              bookings
                .filter((b) => b.status === "CONFIRMED")
                .slice(0, 3)
                .map((b) => (
                  <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: T.surfaceAlt, borderRadius: 12, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>
                        {b.seniorId?.firstName || "Senior Mentor"} {b.seniorId?.lastName || ""}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                        {b.seniorId?.designation || "Alumni Interviewer"}
                      </div>
                      <div style={{ fontSize: 11.5, color: T.green, fontWeight: 600, marginTop: 4 }}>
                        {b.slotId?.startTime ? new Date(b.slotId.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Scheduled Session"}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534", padding: "3px 9px", borderRadius: 999 }}>
                      CONFIRMED
                    </span>
                  </div>
                ))
            )}
          </div>

          {/* Recent Referral Requests */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Send size={16} color={T.green} />
                <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Recent Referral Requests</span>
              </div>
              <button
                onClick={() => setTab("referrals")}
                style={{ background: "none", border: "none", color: T.green, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
              >
                View all <ChevronRight size={13} />
              </button>
            </div>

            {referrals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "26px 12px", background: T.surfaceAlt, borderRadius: 12 }}>
                <Send size={28} color={T.muted} style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>No referral requests yet</div>
                <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3 }}>Request referrals directly from verified seniors in top companies.</div>
                <button
                  onClick={() => setReferralModalOpen(true)}
                  style={{ marginTop: 12, background: T.green, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  Request a Referral
                </button>
              </div>
            ) : (
              referrals.slice(0, 3).map((r) => {
                const statusColors = {
                  PENDING: { bg: "#fef3c7", fg: "#b45309" },
                  ACCEPTED: { bg: "#dcfce7", fg: "#15803d" },
                  REJECTED: { bg: "#fee2e2", fg: "#b91c1c" },
                  SUBMITTED: { bg: "#f3e8ff", fg: "#7e22ce" },
                  CANCELLED: { bg: "#f1f5f9", fg: "#64748b" },
                };
                const sc = statusColors[r.status] || { bg: "#f1f5f9", fg: "#64748b" };
                return (
                  <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: T.surfaceAlt, borderRadius: 12, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{r.jobTitle}</div>
                      <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>
                        {r.companyId?.name || "Target Company"} · Senior: {r.seniorId?.firstName || "Mentor"}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.fg, padding: "3px 9px", borderRadius: 999 }}>
                      {r.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Placement Readiness & Quick Student Tools */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Readiness Tracker */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Target size={16} color={T.green} />
              <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Placement Readiness</span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: T.text, fontWeight: 600 }}>Profile Completion</span>
                <span style={{ color: T.muted, fontWeight: 700 }}>{profilePct}%</span>
              </div>
              <div style={{ height: 7, background: T.hover, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${profilePct}%`, background: T.green, borderRadius: 999 }} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: T.text, fontWeight: 600 }}>Resume ATS Strength</span>
                <span style={{ color: T.muted, fontWeight: 700 }}>{atsResult?.score || 75}%</span>
              </div>
              <div style={{ height: 7, background: T.hover, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${atsResult?.score || 75}%`, background: "#3b82f6", borderRadius: 999 }} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: T.text, fontWeight: 600 }}>Daily Referral Requests</span>
                <span style={{ color: T.muted, fontWeight: 700 }}>{todayReferralsCount} / 5 today</span>
              </div>
              <div style={{ height: 7, background: T.hover, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(todayReferralsCount / 5) * 100}%`, background: "#f59e0b", borderRadius: 999 }} />
              </div>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Sparkles size={16} color="#eab308" />
              <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Student Quick Actions</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 12px", textAlign: "left", cursor: "pointer", transition: "all .15s" }}
              >
                <FileText size={18} color="#2563eb" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>Scan Resume</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Instant ATS Score</div>
              </button>

              <button
                onClick={() => setTab("interviews")}
                style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 12px", textAlign: "left", cursor: "pointer", transition: "all .15s" }}
              >
                <Calendar size={18} color="#16a34a" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>Mock Interview</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Practice with Alumni</div>
              </button>

              <button
                onClick={() => setReferralModalOpen(true)}
                style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 12px", textAlign: "left", cursor: "pointer", transition: "all .15s" }}
              >
                <Send size={18} color="#d97706" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>Ask Referral</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Direct to Seniors</div>
              </button>

              <button
                onClick={() => setTab("roadmaps")}
                style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 12px", textAlign: "left", cursor: "pointer", transition: "all .15s" }}
              >
                <Building2 size={18} color="#7c3aed" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>Prep Roadmaps</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Company Stages</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* 2. Student Profile View (Detail Card + Edit Mode) */
  const renderProfileView = () => {
    // Edit / Create Form Mode
    if (isEditingProfile || !profile) {
      return (
        <div style={{ maxWidth: 860, margin: "0 auto", width: "100%" }}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: `1px solid ${T.border}`, paddingBottom: 18 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={22} color={T.green} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>
                      {profile ? "Edit Student Profile" : "Create Student Profile"}
                    </h2>
                    <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
                      Keep your credentials and resume updated for mock interviews and referral requests.
                    </p>
                  </div>
                </div>
              </div>
              {profile && (
                <button
                  type="button"
                  onClick={handleCancelEditProfile}
                  style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* 1. Basic Information */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <User size={14} /> Personal Information
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>First Name *</span>
                    <input
                      value={pForm.firstName}
                      onChange={(e) => setPForm({ ...pForm, firstName: e.target.value })}
                      required
                      placeholder="e.g. Rahul"
                      style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Last Name *</span>
                    <input
                      value={pForm.lastName}
                      onChange={(e) => setPForm({ ...pForm, lastName: e.target.value })}
                      required
                      placeholder="e.g. Sharma"
                      style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Phone Number</span>
                    <input
                      value={pForm.phone}
                      onChange={(e) => setPForm({ ...pForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Registered Email</span>
                    <input
                      value={user?.email || ""}
                      disabled
                      style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.hover, color: T.muted, fontSize: 13.5, outline: "none", cursor: "not-allowed" }}
                    />
                  </label>
                </div>
              </div>

              {/* 2. Academic Background */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <GraduationCap size={15} /> Academic Details
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>College / University</span>
                    <input
                      value={pForm.college}
                      onChange={(e) => setPForm({ ...pForm, college: e.target.value })}
                      placeholder="e.g. IIT Bombay / NIT Trichy"
                      style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Degree</span>
                    <input
                      value={pForm.degree}
                      onChange={(e) => setPForm({ ...pForm, degree: e.target.value })}
                      placeholder="e.g. B.Tech / BCA / MCA"
                      style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Branch / Specialization</span>
                    <input
                      value={pForm.branch}
                      onChange={(e) => setPForm({ ...pForm, branch: e.target.value })}
                      placeholder="e.g. Computer Science"
                      style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Graduation Year</span>
                    <input
                      type="number"
                      value={pForm.graduationYear}
                      onChange={(e) => setPForm({ ...pForm, graduationYear: e.target.value })}
                      placeholder="e.g. 2026"
                      style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
                    />
                  </label>
                </div>
              </div>

              {/* 3. Bio */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <FileText size={14} /> Career Bio & Aspirations
                </div>
                <textarea
                  rows={3}
                  value={pForm.bio}
                  onChange={(e) => setPForm({ ...pForm, bio: e.target.value })}
                  placeholder="Tell seniors about your target job roles, preferred domains, projects, and career goals..."
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              {/* 4. Skills */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Code2 size={14} /> Technical Skills
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    value={pForm.skillInput}
                    onChange={(e) => setPForm({ ...pForm, skillInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (pForm.skillInput.trim()) {
                          setPForm({
                            ...pForm,
                            skills: [...new Set([...pForm.skills, pForm.skillInput.trim()])],
                            skillInput: "",
                          });
                        }
                      }
                    }}
                    placeholder="Type a skill and press Enter (e.g. React, C++, Node.js, Python)"
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (pForm.skillInput.trim()) {
                        setPForm({
                          ...pForm,
                          skills: [...new Set([...pForm.skills, pForm.skillInput.trim()])],
                          skillInput: "",
                        });
                      }
                    }}
                    style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, borderRadius: 10, padding: "0 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {pForm.skills.length === 0 ? (
                    <span style={{ fontSize: 12, color: T.muted, fontStyle: "italic" }}>No skills added yet</span>
                  ) : (
                    pForm.skills.map((sk) => (
                      <span key={sk} style={{ display: "flex", alignItems: "center", gap: 6, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999 }}>
                        {sk}
                        <button
                          type="button"
                          onClick={() => setPForm({ ...pForm, skills: pForm.skills.filter((s) => s !== sk) })}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#166534", display: "flex", padding: 0 }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* 5. Placement Resume (Instant Upload) */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <FileText size={14} /> Placement Resume (PDF)
                </div>
                <input
                  ref={profileResumeInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadProfileResume(f);
                  }}
                />

                {pForm.resumeUrl ? (
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileCheck size={20} color="#166534" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>
                          {pForm.resumeFileName || "Student_Resume.pdf"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: 999 }}>
                            ☁ Cloudinary Stored
                          </span>
                          {pForm.atsScore && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", background: "#dbeafe", padding: "2px 8px", borderRadius: 999 }}>
                              ATS: {pForm.atsScore}/100
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => openResumeModal(pForm.resumeUrl, pForm.resumeFileName || "Resume Preview")}
                        style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 9, padding: "7px 13px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                      >
                        <Eye size={14} /> Preview
                      </button>
                      <button
                        type="button"
                        disabled={resumeUploading}
                        onClick={() => profileResumeInputRef.current?.click()}
                        style={{ background: T.green, border: "none", color: "#fff", borderRadius: 9, padding: "7px 13px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, opacity: resumeUploading ? 0.7 : 1 }}
                      >
                        <RefreshCw size={13} className={resumeUploading ? "animate-spin" : ""} />
                        {resumeUploading ? "Uploading..." : "Replace PDF"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !resumeUploading && profileResumeInputRef.current?.click()}
                    style={{
                      border: `1.5px dashed ${resumeUploading ? T.green : T.border}`,
                      borderRadius: 14, padding: "24px 16px", background: T.surfaceAlt,
                      cursor: resumeUploading ? "default" : "pointer", textAlign: "center",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      transition: "all .15s ease",
                    }}
                  >
                    {resumeUploading ? (
                      <>
                        <RefreshCw size={26} color={T.green} className="animate-spin" />
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                          Uploading {pForm.resumeFileName || "resume"} to Cloudinary...
                        </div>
                        <div style={{ fontSize: 12, color: T.muted }}>Storing securely & analyzing readiness</div>
                      </>
                    ) : (
                      <>
                        <Upload size={26} color={T.green} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                          Click to select and instantly upload PDF resume
                        </div>
                        <div style={{ fontSize: 12, color: T.muted }}>PDF format only · Maximum file size 10MB</div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8, borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                {profile && (
                  <button
                    type="button"
                    onClick={handleCancelEditProfile}
                    style={{ flex: 1, background: T.surfaceAlt, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={pSaving}
                  style={{ flex: 2, background: T.green, color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: pSaving ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {pSaving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Saving Profile...
                    </>
                  ) : (
                    profile ? "Save Changes" : "Create Student Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Detail Display Mode — Centered & 2-Column Balanced Dashboard Layout
    return (
      <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
        {/* Profile Card Header (Spans full width) */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "26px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: T.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0, boxShadow: "0 6px 16px rgba(16,185,129,0.25)" }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.2 }}>
                  {profile.firstName} {profile.lastName}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534" }}>
                    🎓 Student Candidate
                  </span>
                  {user?.email && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: T.muted, background: T.surfaceAlt, padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border}` }}>
                      <Mail size={12} color={T.muted} /> {user.email}
                    </span>
                  )}
                  {profile.phone && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: T.muted, background: T.surfaceAlt, padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border}` }}>
                      <Phone size={12} color={T.muted} /> {profile.phone}
                    </span>
                  )}
                  {profile.college && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: T.muted, background: T.surfaceAlt, padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border}` }}>
                      <Building2 size={12} color={T.muted} /> {profile.college}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditingProfile(true)}
              style={{
                background: T.green, color: "#fff", border: "none", borderRadius: 12,
                padding: "10px 20px", fontWeight: 700, fontSize: 13.5,
                display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(16,185,129,0.25)",
              }}
            >
              <Pencil size={15} /> Edit Profile
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Body Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          {/* Left Column: Academic Details & Career Bio */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Academic Details Card */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <GraduationCap size={18} color={T.green} />
                </div>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Academic Background</span>
                  <div style={{ fontSize: 11.5, color: T.muted }}>Degree & University Details</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, padding: "12px 14px", borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>College / University</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginTop: 4, wordBreak: "break-word" }}>
                    {profile.college || "Not provided"}
                  </div>
                </div>
                <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, padding: "12px 14px", borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Degree</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginTop: 4 }}>
                    {profile.degree || "Not provided"}
                  </div>
                </div>
                <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, padding: "12px 14px", borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Branch / Major</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginTop: 4, wordBreak: "break-word" }}>
                    {profile.branch || "Not provided"}
                  </div>
                </div>
                <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, padding: "12px 14px", borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Graduation Year</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginTop: 4 }}>
                    {profile.graduationYear || "Not provided"}
                  </div>
                </div>
              </div>
            </div>

            {/* Career Bio Card */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Target size={18} color="#d97706" />
                </div>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Career Bio & Aspirations</span>
                  <div style={{ fontSize: 11.5, color: T.muted }}>Placement Focus & Goals</div>
                </div>
              </div>
              <div style={{ fontSize: 13.5, color: profile.bio ? T.text : T.muted, lineHeight: 1.65, background: T.surfaceAlt, padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}` }}>
                {profile.bio || "No career bio added yet. Click 'Edit Profile' to share your focus and target companies with seniors."}
              </div>
            </div>
          </div>

          {/* Right Column: Placement Resume & Technical Skills */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Placement Resume Card */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={18} color={T.green} />
                  </div>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Placement Resume</span>
                    <div style={{ fontSize: 11.5, color: T.muted }}>Verified on Cloudinary</div>
                  </div>
                </div>
                <input
                  ref={profileResumeInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadProfileResume(f);
                  }}
                />
                <button
                  onClick={() => profileResumeInputRef.current?.click()}
                  disabled={resumeUploading}
                  style={{
                    background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10,
                    padding: "7px 13px", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
                  }}
                >
                  <FileUp size={14} color={T.green} /> {profile.resumeUrl ? "Update Resume" : "Upload Resume"}
                </button>
              </div>

              {profile.resumeUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileCheck size={22} color="#166534" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {profile.resumeFileName || "Placement_Resume.pdf"}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: 999 }}>
                            ☁ Cloudinary Verified
                          </span>
                          {profile.atsScore ? (
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: profile.atsScore >= 75 ? "#166534" : "#b45309", background: profile.atsScore >= 75 ? "#dcfce7" : "#fef3c7", padding: "2px 8px", borderRadius: 999 }}>
                              ATS Score: {profile.atsScore}/100
                            </span>
                          ) : (
                            <span style={{ fontSize: 10.5, color: T.muted }}>ATS score pending</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                      <button
                        type="button"
                        onClick={() => openResumeModal(profile.resumeUrl, profile.resumeFileName || "Placement Resume")}
                        style={{ flex: 1, minWidth: 80, background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 9, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                      >
                        <Eye size={13} /> Preview
                      </button>
                      <a
                        href={getResumeDownloadUrl(profile.resumeUrl, profile.resumeFileName || "Placement_Resume.pdf")}
                        target="_blank"
                        rel="noreferrer"
                        download
                        style={{ flex: 1, minWidth: 80, background: T.surface, border: `1px solid ${T.border}`, color: T.text, textDecoration: "none", borderRadius: 9, padding: "7px 12px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                      >
                        <Download size={13} /> Download
                      </a>
                      <button
                        type="button"
                        disabled={atsLoading}
                        onClick={handleScoreProfileResume}
                        style={{ flex: 1.2, minWidth: 100, background: T.green, border: "none", color: "#fff", borderRadius: 9, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                      >
                        <Sparkles size={13} /> {atsLoading ? "Scoring..." : "ATS Review"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: T.surfaceAlt, border: `1.5px dashed ${T.border}`, borderRadius: 14, padding: "24px 16px", textAlign: "center" }}>
                  <Upload size={28} color={T.muted} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>No resume uploaded yet</div>
                  <div style={{ fontSize: 12, color: T.muted, margin: "4px 0 14px" }}>
                    Upload your PDF resume to store it securely on Cloudinary and attach it to job referral requests.
                  </div>
                  <button
                    type="button"
                    onClick={() => profileResumeInputRef.current?.click()}
                    style={{ background: T.green, color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    Upload PDF Resume
                  </button>
                </div>
              )}
            </div>

            {/* Technical Skills Card */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Code2 size={18} color="#7c3aed" />
                  </div>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Technical Skills</span>
                    <div style={{ fontSize: 11.5, color: T.muted }}>Domain & Language Competencies</div>
                  </div>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, background: "#ede9fe", color: "#7c3aed", padding: "2px 8px", borderRadius: 999 }}>
                  {profile.skills?.length || 0} Skills
                </span>
              </div>

              {!profile.skills || profile.skills.length === 0 ? (
                <div style={{ fontSize: 13, color: T.muted, background: T.surfaceAlt, padding: "14px", borderRadius: 12, border: `1px solid ${T.border}` }}>
                  No skills added yet. Click 'Edit Profile' to add skills for matching referrals!
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {profile.skills.map((s) => (
                    <span key={s} style={{ fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#166534", padding: "5px 12px", borderRadius: 999 }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* 3. Mock Interviews View */
  const renderInterviewsView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Mock Interviews with Seniors</h2>
        <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
          Schedule 1-on-1 interview practice sessions with verified alumni and receive actionable feedback.
        </p>
      </div>

      {/* Available Slots */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={18} color={T.green} />
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Available Interview Slots</span>
          </div>
          <span style={{ fontSize: 12, color: T.muted }}>{slots.length} open slots</span>
        </div>

        {slots.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 16px", background: T.surfaceAlt, borderRadius: 14 }}>
            <Calendar size={32} color={T.muted} style={{ margin: "0 auto 8px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>No Senior Slots Available Right Now</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Seniors post availability slots regularly. Please check back soon!</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {slots.map((slot) => {
              const senior = slot.seniorId || {};
              const seniorName = `${senior.firstName || "Senior"} ${senior.lastName || "Alumni"}`;
              const startStr = new Date(slot.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
              const endStr = new Date(slot.endTime).toLocaleTimeString([], { timeStyle: "short" });

              return (
                <div key={slot._id} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                        {seniorName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: T.text }}>{seniorName}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{senior.designation || "Senior Software Engineer"}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.text, fontWeight: 600, marginBottom: 4 }}>
                      <Clock size={13} color={T.green} />
                      {startStr} – {endStr}
                    </div>
                  </div>

                  <button
                    onClick={() => { setBookingSlot(slot); setBookingNotes(""); }}
                    style={{ marginTop: 14, width: "100%", background: T.green, color: "#fff", border: "none", borderRadius: 10, padding: "8px 0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    Book This Slot
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Student Bookings / History */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Clock size={18} color="#2563eb" />
          <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>My Booked Interviews</span>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 16px", background: T.surfaceAlt, borderRadius: 14 }}>
            <div style={{ fontSize: 13, color: T.muted }}>You have not booked any mock interviews yet.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bookings.map((b) => {
              const senior = b.seniorId || {};
              const seniorName = `${senior.firstName || "Senior"} ${senior.lastName || ""}`;
              const timeStr = b.slotId?.startTime
                ? new Date(b.slotId.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                : "Scheduled Time";

              return (
                <div key={b._id} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{seniorName}</div>
                    <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{senior.designation || "Senior Mentor"}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.green, marginTop: 4 }}>{timeStr}</div>
                    {b.notes && (
                      <div style={{ fontSize: 11.5, color: T.text, marginTop: 6, fontStyle: "italic" }}>
                        Note: "{b.notes}"
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {b.status === "CONFIRMED" && b.meetLink && (
                      <a
                        href={b.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 12px",
                          borderRadius: 8,
                          background: "#2563eb",
                          color: "#ffffff",
                          textDecoration: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Video size={13} />
                        Join Meet
                      </a>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                      background: b.status === "CONFIRMED" ? "#dcfce7" : b.status === "COMPLETED" ? "#dbeafe" : "#fee2e2",
                      color: b.status === "CONFIRMED" ? "#166534" : b.status === "COMPLETED" ? "#1e40af" : "#991b1b",
                    }}>
                      {b.status}
                    </span>
                    {b.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        style={{ background: "none", border: `1px solid #fca5a5`, color: "#dc2626", borderRadius: 8, padding: "4px 10px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  /* 4. Job Referrals View */
  const renderReferralsView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Alumni & Senior Job Referrals</h2>
          <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
            Directly request referrals into target product companies from verified seniors.
          </p>
        </div>
        <button
          onClick={() => setReferralModalOpen(true)}
          style={{ background: T.green, color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
        >
          <Plus size={16} /> Request New Referral
        </button>
      </div>

      {/* Quota Tracker Banner */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Info size={18} color={T.green} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Daily Request Quota: {todayReferralsCount} / 5 used today</div>
            <div style={{ fontSize: 11.5, color: T.muted }}>To maintain high referral quality, students can request up to 5 referrals per day.</div>
          </div>
        </div>
        <div style={{ width: 140, height: 8, background: T.hover, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(todayReferralsCount / 5) * 100}%`, background: T.green, borderRadius: 999 }} />
        </div>
      </div>

      {/* Sent Referrals List */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16 }}>My Sent Referral Requests</div>

        {referrals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 16px", background: T.surfaceAlt, borderRadius: 14 }}>
            <Send size={32} color={T.muted} style={{ margin: "0 auto 8px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>No Referral Requests Sent</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Find an open position at your dream company and ask an alumni senior for a referral!</div>
            <button
              onClick={() => setReferralModalOpen(true)}
              style={{ marginTop: 14, background: T.green, color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              Request a Referral
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {referrals.map((r) => {
              const statusColors = {
                PENDING: { bg: "#fef3c7", fg: "#b45309", label: "Pending Senior Review" },
                ACCEPTED: { bg: "#dcfce7", fg: "#15803d", label: "Accepted by Senior" },
                REJECTED: { bg: "#fee2e2", fg: "#b91c1c", label: "Declined" },
                SUBMITTED: { bg: "#f3e8ff", fg: "#7e22ce", label: "Submitted to Company Portal" },
                CANCELLED: { bg: "#f1f5f9", fg: "#64748b", label: "Cancelled" },
              };
              const sc = statusColors[r.status] || { bg: "#f1f5f9", fg: "#64748b", label: r.status };

              return (
                <div key={r._id} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CompanyLogo name={r.companyId?.name || "Company"} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{r.jobTitle}</div>
                        <div style={{ fontSize: 12, color: T.muted }}>
                          {r.companyId?.name || "Company"} · Senior: {r.seniorId?.firstName || "Mentor"} {r.seniorId?.lastName || ""}
                        </div>
                      </div>
                    </div>

                    {r.message && (
                      <div style={{ fontSize: 12, color: T.muted, marginTop: 8, fontStyle: "italic", maxWidth: 500 }}>
                        "{r.message}"
                      </div>
                    )}
                    {r.jobUrl && (
                      <a href={r.jobUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, textDecoration: "none" }}>
                        View Job Link <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: sc.bg, color: sc.fg }}>
                      {sc.label}
                    </span>
                    {r.status === "PENDING" && (
                      <button
                        onClick={() => handleCancelReferral(r._id)}
                        style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "4px 10px", fontSize: 11.5, cursor: "pointer" }}
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  /* 5. Companies & Roadmaps View */
  const renderRoadmapsView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {selectedCompany ? (
        /* Company Roadmap Detail View */
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <button
            onClick={() => setSelectedCompany(null)}
            style={{ background: "none", border: "none", color: T.green, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", width: "fit-content" }}
          >
            <ChevronLeft size={16} /> Back to all companies
          </button>

          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
            <CompanyLogo name={selectedCompany.name} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{selectedCompany.name}</div>
              <div style={{ fontSize: 12.5, color: T.muted }}>{selectedCompany.industry} · {selectedCompany.headquarters}</div>
              {selectedCompany.website && (
                <a href={selectedCompany.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.green, display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, textDecoration: "none" }}>
                  Visit Careers Portal <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>

          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 6 }}>
              {roadmapData?.title || `${selectedCompany.name} Placement Preparation Roadmap`}
            </div>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
              {roadmapData?.description || "Structured stage-by-stage guide curated by seniors who cracked this company."}
            </div>

            {loadingRoadmap ? (
              <div style={{ textAlign: "center", padding: 40, color: T.muted }}>Loading roadmap details...</div>
            ) : !roadmapData?.stages || roadmapData.stages.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, background: T.surfaceAlt, borderRadius: 12, color: T.muted }}>
                No custom roadmap published yet for this company. Check back soon or request a mock interview to get 1-on-1 insights!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {roadmapData.stages.map((stage, idx) => (
                  <div key={idx} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ width: 26, height: 26, borderRadius: "50%", background: T.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                        {stage.order || idx + 1}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{stage.title}</span>
                    </div>
                    {stage.description && (
                      <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 12, marginLeft: 34 }}>
                        {stage.description}
                      </div>
                    )}
                    {stage.topics && stage.topics.length > 0 && (
                      <div style={{ marginLeft: 34, marginBottom: 10 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Key Focus Topics:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {stage.topics.map((top, ti) => {
                            const topTitle = typeof top === "string" ? top : (top?.title || top?.name || "");
                            const topDesc = typeof top === "object" ? top?.description : null;
                            return (
                              <span
                                key={ti}
                                title={topDesc || undefined}
                                style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 8, background: T.hover, color: T.text, border: `1px solid ${T.border}` }}
                              >
                                • {topTitle}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {(() => {
                      const stageRes = Array.isArray(stage.resources) ? stage.resources : [];
                      const topicRes = Array.isArray(stage.topics)
                        ? stage.topics.flatMap((t) => (Array.isArray(t?.resources) ? t.resources : []))
                        : [];
                      const allResources = [...stageRes, ...topicRes].filter((res) => res && res.title && res.url);
                      if (allResources.length === 0) return null;

                      return (
                        <div style={{ marginLeft: 34, marginTop: 8 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Study Materials:</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                            {allResources.map((res, ri) => (
                              <a
                                key={ri}
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: 12, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                              >
                                {res.title} <ExternalLink size={11} />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Company Directory Grid */
        <div>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Target Companies & Hiring Roadmaps</h2>
            <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
              Explore interview stages, coding assessments, and specific hiring roadmaps for top product companies.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {companies.map((comp) => (
              <div
                key={comp._id || comp.id}
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <CompanyLogo name={comp.name} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{comp.name}</div>
                      <div style={{ fontSize: 11.5, color: T.muted }}>{comp.industry || "Technology"}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.4, margin: "0 0 14px" }}>
                    {comp.description || "Leading technology brand hiring software and product engineering talent."}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectCompany(comp)}
                  style={{ width: "100%", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 0", color: T.green, fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                >
                  View Preparation Roadmap <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* 6. ATS Resume Scanner View */
  const renderATSView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: atsResult ? 1160 : 720, width: "100%" }}>
      {/* Top Header & Upload Bar */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "24px 28px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: "0 0 4px" }}>Resume ATS Scanner & Live Review</h2>
            <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
              Scan your resume to verify keyword density, structure, and placement readiness score.
            </p>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleResume} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={atsLoading}
            style={{
              background: T.green, color: "#fff", border: "none", borderRadius: 11,
              padding: "10px 18px", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
              opacity: atsLoading ? 0.7 : 1,
            }}
          >
            <Upload size={16} /> {atsLoading ? "Scanning..." : "Upload New PDF"}
          </button>
        </div>

        {/* Saved Profile Resume Shortcut */}
        {profile?.resumeUrl && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileCheck size={18} color="#166534" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                  {profile.resumeFileName || "Student_Profile_Resume.pdf"}
                </div>
                <div style={{ fontSize: 11.5, color: T.muted, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Profile Resume (Cloudinary)</span>
                  {profile.atsScore && <span style={{ fontWeight: 700, color: "#166534" }}>• Previous ATS Score: {profile.atsScore}/100</span>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() => openResumeModal(profile.resumeUrl, profile.resumeFileName || "Profile Resume")}
                style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
              >
                <Eye size={13} /> View
              </button>
              <button
                type="button"
                disabled={atsLoading}
                onClick={handleScoreProfileResume}
                style={{ background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
              >
                <Sparkles size={13} /> {atsLoading ? "Analyzing..." : "Re-Scan Saved Resume"}
              </button>
            </div>
          </div>
        )}

        {!profile?.resumeUrl && !atsResult && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={atsLoading}
            style={{ width: "100%", border: `2px dashed ${T.green}`, borderRadius: 14, padding: "36px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: T.greenLight, cursor: "pointer", opacity: atsLoading ? 0.7 : 1, marginTop: 10 }}
          >
            {atsLoading ? (
              <div style={{ width: 32, height: 32, border: `3px solid ${T.green}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            ) : (
              <Upload size={28} color={T.green} />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>
                {atsLoading ? "Scanning and Scoring Resume..." : "Click to upload PDF resume"}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Supports .pdf files up to 10MB</div>
            </div>
          </button>
        )}
      </div>

      {/* ATS Side-by-Side: Resume Preview & Score Breakdown */}
      {atsResult && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 20, alignItems: "start" }}>
          {/* Left Column: Live Resume Preview */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={18} color={T.green} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                    {atsResult.fileName || "Scored Resume Document"}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>PDF Document View</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {atsResult.fileUrl && (
                  <>
                    <button
                      type="button"
                      onClick={() => openResumeModal(atsResult.fileUrl, atsResult.fileName || "Resume Preview")}
                      style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Eye size={13} /> Fullscreen
                    </button>
                    <a
                      href={getResumeDownloadUrl(atsResult.fileUrl, atsResult.fileName || "Scored_Resume.pdf")}
                      target="_blank"
                      rel="noreferrer"
                      download
                      style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, textDecoration: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Download size={13} /> Download
                    </a>
                  </>
                )}
              </div>
            </div>

            {atsResult.fileUrl ? (
              <div style={{ width: "100%", height: 580, borderRadius: 12, overflow: "hidden", background: "#1e293b", border: `1px solid ${T.border}`, position: "relative" }}>
                <iframe
                  src={getResumeViewUrl(atsResult.fileUrl, atsResult.fileName || "Scored_Resume.pdf")}
                  title="ATS Resume Document"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>
            ) : (
              <div style={{ height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.surfaceAlt, borderRadius: 12, gap: 8 }}>
                <FileText size={32} color={T.muted} />
                <div style={{ fontSize: 13, color: T.muted }}>Resume preview not available</div>
              </div>
            )}
          </div>

          {/* Right Column: Score & Placement Breakdown */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.text }}>ATS Score & Analysis</h3>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{atsResult.wordCount || "N/A"} words evaluated</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: atsResult.score >= 80 ? "#16a34a" : atsResult.score >= 60 ? "#d97706" : "#dc2626", lineHeight: 1 }}>
                  {atsResult.score}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: T.muted }}>/100</span>
              </div>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: atsResult.score >= 80 ? "#dcfce7" : atsResult.score >= 60 ? "#fef3c7" : "#fee2e2", color: atsResult.score >= 80 ? "#166534" : atsResult.score >= 60 ? "#a16207" : "#b91c1c", width: "fit-content" }}>
              <CheckCircle2 size={14} /> {atsResult.level || (atsResult.score >= 80 ? "Top Tier Readiness" : atsResult.score >= 60 ? "Interview Ready" : "Needs Revision")}
            </div>

            {/* Matched Keywords */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Matched Industry Keywords ({atsResult.matchedKeywords?.length || 0})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {atsResult.matchedKeywords && atsResult.matchedKeywords.length > 0 ? (
                  atsResult.matchedKeywords.map((k) => (
                    <span key={k} style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534" }}>
                      {k}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: T.muted }}>No keywords matched yet</span>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Recommended Missing Keywords ({atsResult.missingKeywords?.length || 0})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 ? (
                  atsResult.missingKeywords.slice(0, 12).map((k) => (
                    <span key={k} style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "#fee2e2", color: "#b91c1c" }}>
                      {k}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: T.muted }}>Great job! No critical keywords missing.</span>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {atsResult.recommendations?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Actionable Recommendations
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {atsResult.recommendations.map((r, i) => (
                    <div key={i} style={{ fontSize: 13, color: T.text, display: "flex", gap: 8, lineHeight: 1.5 }}>
                      <span style={{ color: T.green, fontWeight: 800 }}>•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* ─────────────────────────── Modals ────────────────────────────────────── */

  /* Book Interview Modal */
  const renderBookingModal = () => {
    if (!bookingSlot) return null;
    const senior = bookingSlot.seniorId || {};
    const seniorName = `${senior.firstName || "Senior"} ${senior.lastName || ""}`;
    const startStr = new Date(bookingSlot.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, width: "100%", maxWidth: 460, padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.text }}>Confirm Mock Interview Booking</h3>
            <button onClick={() => setBookingSlot(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={18} /></button>
          </div>

          <div style={{ background: T.surfaceAlt, padding: 14, borderRadius: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Interviewer: {seniorName}</div>
            <div style={{ fontSize: 12, color: T.muted }}>{senior.designation || "Senior Software Engineer"}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: T.green, marginTop: 6 }}>Time: {startStr}</div>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Prep Notes / Topics to Practice (Optional)</span>
            <textarea
              rows={3}
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              placeholder="e.g. Focus on LeetCode Dynamic Programming, System Design, or Resume Project Q&A"
              style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13, outline: "none", resize: "none" }}
            />
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setBookingSlot(null)}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={bookingLoading}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: T.green, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: bookingLoading ? 0.7 : 1 }}
            >
              {bookingLoading ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* Request Referral Modal */
  const renderReferralModal = () => {
    if (!referralModalOpen) return null;

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, width: "100%", maxWidth: 500, padding: 26, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.text }}>Request a Job Referral</h3>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Daily Quota: {todayReferralsCount}/5 used today</div>
            </div>
            <button onClick={() => setReferralModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmitReferral} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Target Company */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Target Company *</span>
              <select
                value={referralForm.companyId}
                onChange={(e) => setReferralForm({ ...referralForm, companyId: e.target.value })}
                required
                style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
              >
                <option value="">Select Target Company</option>
                {companies.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Senior Selection */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Senior / Alumni Mentor *</span>
              {activeSeniors.length > 0 ? (
                <select
                  value={referralForm.seniorId}
                  onChange={(e) => setReferralForm({ ...referralForm, seniorId: e.target.value })}
                  required
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
                >
                  <option value="">Select Verified Senior</option>
                  {activeSeniors.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} ({s.designation || "Senior Software Engineer"})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={referralForm.seniorId}
                  onChange={(e) => setReferralForm({ ...referralForm, seniorId: e.target.value })}
                  placeholder="Enter Senior Profile ID (e.g. 64b1f...)"
                  required
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
                />
              )}
            </label>

            {/* Job Title */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Job Title *</span>
              <input
                value={referralForm.jobTitle}
                onChange={(e) => setReferralForm({ ...referralForm, jobTitle: e.target.value })}
                placeholder="e.g. Software Development Engineer - Intern"
                required
                style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
              />
            </label>

            {/* Job URL */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Job Listing URL (Optional)</span>
              <input
                type="url"
                value={referralForm.jobUrl}
                onChange={(e) => setReferralForm({ ...referralForm, jobUrl: e.target.value })}
                placeholder="https://careers.google.com/jobs/results/..."
                style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none" }}
              />
            </label>

            {/* Elevator Pitch / Message */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Message / Elevator Pitch to Senior</span>
              <textarea
                rows={3}
                value={referralForm.message}
                onChange={(e) => setReferralForm({ ...referralForm, message: e.target.value })}
                placeholder="Explain why you're a great fit for this opening, top projects, GitHub or portfolio links..."
                style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 13.5, outline: "none", resize: "none" }}
              />
            </label>

            {/* Attached Placement Resume */}
            <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14 }}>
              <input
                ref={referralResumeInputRef}
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadProfileResume(f);
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={17} color="#166534" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                      {referralForm.resumeFileName || profile?.resumeFileName || "Candidate Resume (PDF)"}
                    </div>
                    <div style={{ fontSize: 11, color: T.muted }}>
                      {(referralForm.resumeUrl || profile?.resumeUrl) ? "Attached automatically for senior review & evaluation" : "No resume found. Upload to include with request."}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {(referralForm.resumeUrl || profile?.resumeUrl) ? (
                    <button
                      type="button"
                      onClick={() => openResumeModal(referralForm.resumeUrl || profile?.resumeUrl, referralForm.resumeFileName || profile?.resumeFileName || "Candidate Resume")}
                      style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Eye size={13} /> Preview
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={resumeUploading}
                    onClick={() => referralResumeInputRef.current?.click()}
                    style={{ background: T.green, border: "none", color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Upload size={12} /> {resumeUploading ? "Uploading..." : (referralForm.resumeUrl || profile?.resumeUrl ? "Change" : "Upload")}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setReferralModalOpen(false)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={referralSubmitting}
                style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: T.green, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", opacity: referralSubmitting ? 0.7 : 1 }}
              >
                {referralSubmitting ? "Sending..." : "Submit Referral Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  /* Resume Document Preview Modal */
  const renderResumeModal = () => {
    if (!resumeModalOpen || !resumeModalUrl) return null;
    const viewUrl = getResumeViewUrl(resumeModalUrl, resumeModalTitle || "Resume.pdf");
    const downloadUrl = getResumeDownloadUrl(resumeModalUrl, resumeModalTitle || "Resume.pdf");
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, width: "100%", maxWidth: 850, height: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
          {/* Modal Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={18} color="#166534" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{resumeModalTitle || "Candidate Resume"}</div>
                <div style={{ fontSize: 11.5, color: T.muted }}>PDF Document Viewer</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a
                href={viewUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.surface, border: `1px solid ${T.border}`, color: T.text, textDecoration: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}
              >
                <ExternalLink size={13} /> Fullscreen
              </a>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                download
                style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.green, color: "#fff", textDecoration: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}
              >
                <Download size={13} /> Download
              </a>
              <button
                type="button"
                onClick={() => setResumeModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>
          </div>
          {/* Modal Viewer */}
          <div style={{ flex: 1, background: "#1e293b", position: "relative" }}>
            <iframe
              src={viewUrl}
              title={resumeModalTitle || "Resume Document"}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────────────── Main Render ───────────────────────────────── */
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg, fontFamily: "Figtree, Inter, sans-serif" }}>
      <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />
      {renderBookingModal()}
      {renderReferralModal()}
      {renderResumeModal()}

      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside
        style={{
          width: 230, flexShrink: 0, height: "100vh",
          background: T.surface, borderRight: `1px solid ${T.border}`,
          overflowY: "auto",
        }}
        className="hidden lg:block"
      >
        {renderSidebarContent()}
      </aside>

      {/* ── Mobile Sidebar Drawer ────────────────────────────────────────── */}
      {sideOpen && (
        <>
          <div
            onClick={() => setSideOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,.5)" }}
          />
          <div
            style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 240, zIndex: 50, background: T.surface, borderRight: `1px solid ${T.border}`, overflowY: "auto" }}
          >
            {renderSidebarContent()}
          </div>
        </>
      )}

      {/* ── Main Panel ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", minWidth: 0 }}>
        {/* Header Bar */}
        <header
          style={{
            height: 58, flexShrink: 0, background: T.surface, borderBottom: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", gap: 12, padding: "0 20px", zIndex: 10,
          }}
        >
          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            onClick={() => setSideOpen(!sideOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "none", marginRight: 4 }}
          >
            <Menu size={22} />
          </button>

          {/* Search Bar */}
          <div
            style={{
              flex: 1, maxWidth: 440, display: "flex", alignItems: "center", gap: 10,
              background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "8px 14px",
            }}
          >
            <Search size={15} color={T.muted} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, interview roadmaps, or skills..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: T.text }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {/* Theme Toggle */}
            <button
              onClick={() => {
                setDark((prev) => {
                  const next = !prev;
                  localStorage.setItem("hireloop_theme", next ? "dark" : "light");
                  return next;
                });
              }}
              title="Toggle theme"
              style={{
                width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`,
                background: T.surface, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: dark ? "#fbbf24" : T.muted,
              }}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications — real-time bell with unread badge */}
            <NotificationBell token={token} dark={dark} />

            {/* Avatar Pill */}
            <div
              onClick={() => setTab("profile")}
              title="View profile"
              style={{
                width: 36, height: 36, borderRadius: "50%", background: T.green,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {tab === "dashboard"  && renderDashboardView()}
          {tab === "profile"    && renderProfileView()}
          {tab === "interviews" && renderInterviewsView()}
          {tab === "referrals"  && renderReferralsView()}
          {tab === "roadmaps"   && renderRoadmapsView()}
          {tab === "ats"        && renderATSView()}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .lg\\:block { display: block !important; }
        @media (max-width: 1023px) {
          .lg\\:block { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}