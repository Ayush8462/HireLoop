/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Calendar, ChevronRight, Clock, Code2,
  FileText, Moon, Plus, Search,
  Sun, User, X, CheckCircle2, AlertCircle,
  LogOut, LayoutDashboard,
  Menu, Send, ExternalLink,
  Pencil, Briefcase, Download, Eye, Sparkles, Check, FileCheck, Video
} from "lucide-react";
import { logout } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyProfile, updateMyProfile, createProfile, getResumeViewUrl, getResumeDownloadUrl } from "../../api/profile.js";
import { getAllCompanies } from "../../api/company.js";
import {
  createSlot,
  getAvailableSlots,
  completeInterview,
  cancelInterview,
  getSeniorHistory,
  getInterviewStats
} from "../../api/interview.js";
import { getMyReceivedReferrals, updateReferralStatus } from "../../api/referral.js";
import { uploadAndScoreResume, scoreResumeUrl } from "../../api/ats.js";
import NotificationBell from "../../components/notifications/NotificationBell.jsx";

/* ─────────────────────────── Default Companies ─────────────────────────────── */
const DEFAULT_COMPANIES = [
  { _id: "comp_google", name: "Google", industry: "Internet & Cloud", headquarters: "Mountain View, CA / Bangalore" },
  { _id: "comp_microsoft", name: "Microsoft", industry: "Enterprise & Cloud", headquarters: "Redmond, WA / Hyderabad" },
  { _id: "comp_amazon", name: "Amazon", industry: "E-Commerce & AWS", headquarters: "Seattle, WA / Bangalore" },
  { _id: "comp_flipkart", name: "Flipkart", industry: "E-Commerce & Tech", headquarters: "Bangalore, India" },
  { _id: "comp_zomato", name: "Zomato", industry: "Quick Commerce & Tech", headquarters: "Gurgaon, India" },
];

/* ─────────────────────────── Degree Options ────────────────────────────────── */
const DEGREE_OPTIONS = [
  "B.Tech",
  "B.E.",
  "B.S. / B.Sc",
  "BCA",
  "M.Tech",
  "M.E.",
  "M.S. / M.Sc",
  "MCA",
  "MBA",
  "Dual Degree (B.Tech + M.Tech)",
  "Ph.D.",
  "Other",
];

export default function SeniorDashboard() {
  const navigate = useNavigate();
  const { logoutUser, token } = useAuth();
  const fileRef = useRef(null);

  // Theme state synced with LocalStorage
  const [dark, setDark] = useState(() => localStorage.getItem("hireloop_theme") === "dark");
  const [sideOpen, setSideOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  // Core Data
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [, setStats] = useState(null);

  // Filter States
  const [referralFilter, setReferralFilter] = useState("ALL");
  const [interviewSubTab, setInterviewSubTab] = useState("sessions"); // "sessions" | "slots"

  // Modals & Action States
  const [createSlotOpen, setCreateSlotOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    date: "",
    startTime: "18:00",
    endTime: "19:00",
  });
  const [slotSubmitting, setSlotSubmitting] = useState(false);

  // Complete Interview Modal
  const [completeBooking, setCompleteBooking] = useState(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [completingLoading, setCompletingLoading] = useState(false);

  // Senior Profile Form
  const [pForm, setPForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    companyId: "",
    companyName: "",
    designation: "",
    experienceYears: "",
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    bio: "",
    skillInput: "",
    skills: [],
  });
  const [degreeSelect, setDegreeSelect] = useState("");
  const [customDegree, setCustomDegree] = useState("");
  const [pSaving, setPSaving] = useState(false);

  // ATS State (Senior Resume Checker tool)
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);

  // Senior Referral Review & ATS Reviewer State
  const [reviewReferral, setReviewReferral] = useState(null);
  const [reviewAtsLoading, setReviewAtsLoading] = useState(false);
  const [reviewAtsResult, setReviewAtsResult] = useState(null);
  const [resumeViewerUrl, setResumeViewerUrl] = useState("");
  const [resumeViewerTitle, setResumeViewerTitle] = useState("");

  const toast$ = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4500);
  };

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("hireloop_theme", next ? "dark" : "light");
      return next;
    });
  };

  /* ── Theme Tokens matching HireLoop system ─────────────────────────────── */
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

  // Fetch all initial senior data
  const fetchData = async () => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      if (u) {
        setUser(u);
        // If a non-senior visits this page, redirect to student dashboard
        if (u.role && u.role !== "senior" && u.role !== "alumni") {
          navigate("/dashboard", { replace: true });
          return;
        }
      }
    } catch { /* ignore */ }

    // 1. Fetch Companies (needed to resolve employer names)
    let companyList = DEFAULT_COMPANIES;
    try {
      const r = await getAllCompanies();
      const c = r.data?.data?.items || r.data?.data || [];
      companyList = Array.isArray(c) && c.length > 0 ? c : DEFAULT_COMPANIES;
      setCompanies(companyList);
    } catch {
      setCompanies(DEFAULT_COMPANIES);
    }

    // 2. Fetch Profile
    try {
      const r = await getMyProfile();
      const p = r.data?.data;
      if (p) {
        setProfile(p);
        const compName =
          p.companyName ||
          p.companyId?.name ||
          (companyList.find((c) => (c._id || c.id) === (p.companyId?._id || p.companyId))?.name) ||
          "";
        const deg = p.degree || "";
        const isStandard = DEGREE_OPTIONS.filter((d) => d !== "Other").includes(deg);
        setDegreeSelect(isStandard ? deg : deg ? "Other" : "");
        setCustomDegree(isStandard ? "" : deg);
        setPForm({
          firstName: p.firstName || user?.firstName || "",
          lastName: p.lastName || user?.lastName || "",
          phone: p.phone || "",
          companyId: p.companyId?._id || p.companyId || "",
          companyName: compName,
          designation: p.designation || "",
          experienceYears: p.experienceYears !== undefined ? String(p.experienceYears) : "",
          college: p.college || "",
          degree: p.degree || "",
          branch: p.branch || "",
          graduationYear: p.graduationYear ? String(p.graduationYear) : "",
          bio: p.bio || "",
          skillInput: "",
          skills: p.skills || [],
        });
        setIsEditingProfile(false);
      } else {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        if (u) {
          setPForm((prev) => ({
            ...prev,
            firstName: prev.firstName || u.firstName || "",
            lastName: prev.lastName || u.lastName || "",
          }));
        }
        setIsEditingProfile(true);
      }
    } catch {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u) {
        setPForm((prev) => ({
          ...prev,
          firstName: prev.firstName || u.firstName || "",
          lastName: prev.lastName || u.lastName || "",
        }));
      }
      setIsEditingProfile(true);
    }

    // 3. Fetch Received Referrals (Senior Inbox)
    try {
      const r = await getMyReceivedReferrals();
      const items = r.data?.data?.items || r.data?.data || [];
      setReferrals(Array.isArray(items) ? items : []);
    } catch { /* ignore */ }

    // 4. Fetch Senior's Bookings History
    try {
      const r = await getSeniorHistory();
      const items = r.data?.data?.items || r.data?.data || [];
      setBookings(Array.isArray(items) ? items : []);
    } catch { /* ignore */ }

    // 5. Fetch Senior's Slots
    try {
      const r = await getAvailableSlots();
      const items = r.data?.data?.items || r.data?.data || [];
      setMySlots(Array.isArray(items) ? items : []);
    } catch { /* ignore */ }

    // 6. Fetch Overall Stats
    try {
      const r = await getInterviewStats();
      if (r.data?.data) setStats(r.data.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    logoutUser();
    navigate("/login", { replace: true });
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setPSaving(true);
    try {
      const payload = {
        firstName: pForm.firstName,
        lastName: pForm.lastName,
        phone: pForm.phone || undefined,
        companyId: pForm.companyId && /^[0-9a-fA-F]{24}$/.test(pForm.companyId) ? pForm.companyId : undefined,
        companyName: pForm.companyName?.trim() || undefined,
        designation: pForm.designation || undefined,
        experienceYears: pForm.experienceYears ? Number(pForm.experienceYears) : undefined,
        college: pForm.college || undefined,
        degree: pForm.degree || undefined,
        branch: pForm.branch || undefined,
        graduationYear: pForm.graduationYear ? Number(pForm.graduationYear) : undefined,
        bio: pForm.bio || undefined,
        skills: pForm.skills,
      };

      const r = profile
        ? await updateMyProfile(payload)
        : await createProfile({ ...payload, role: "SENIOR" });

      if (r.data?.success || r.data?.data) {
        const updated = r.data?.data || r.data;
        const savedCompany = pForm.companyName?.trim();
        if (!updated.companyName && savedCompany) {
          updated.companyName = savedCompany;
        }
        setProfile(updated);
        const deg = updated.degree || "";
        const isStandard = DEGREE_OPTIONS.filter((d) => d !== "Other").includes(deg);
        setDegreeSelect(isStandard ? deg : deg ? "Other" : "");
        setCustomDegree(isStandard ? "" : deg);
        setIsEditingProfile(false);
        toast$(profile ? "Senior profile updated successfully!" : "Senior profile created successfully!", "success");
      }
    } catch (err) {
      toast$(err.response?.data?.message || err.response?.data?.error?.message || "Failed to update profile", "error");
    } finally {
      setPSaving(false);
    }
  };

  // Create Availability Slot
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      toast$("Please choose date and slot time", "error");
      return;
    }

    const start = new Date(`${slotForm.date}T${slotForm.startTime}:00`);
    const end = new Date(`${slotForm.date}T${slotForm.endTime}:00`);

    if (end <= start) {
      toast$("End time must be after start time", "error");
      return;
    }

    if (start < new Date()) {
      toast$("Slot time cannot be in the past", "error");
      return;
    }

    setSlotSubmitting(true);
    try {
      await createSlot(start.toISOString(), end.toISOString());
      toast$("New interview availability slot published!", "success");
      setCreateSlotOpen(false);
      setSlotForm({ date: "", startTime: "18:00", endTime: "19:00" });
      fetchData();
    } catch (err) {
      toast$(err.response?.data?.message || "Failed to create slot", "error");
    } finally {
      setSlotSubmitting(false);
    }
  };

  // Complete Interview
  const handleCompleteInterview = async () => {
    if (!completeBooking) return;
    setCompletingLoading(true);
    try {
      await completeInterview(completeBooking._id, completionNotes);
      toast$("Interview marked as completed! Feedback recorded.", "success");
      setCompleteBooking(null);
      setCompletionNotes("");
      fetchData();
    } catch (err) {
      toast$(err.response?.data?.message || "Failed to complete interview", "error");
    } finally {
      setCompletingLoading(false);
    }
  };

  // Cancel Interview Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this mock interview booking? The slot will be freed up.")) return;
    try {
      await cancelInterview(bookingId);
      toast$("Interview booking cancelled", "success");
      fetchData();
    } catch (err) {
      toast$(err.response?.data?.message || "Failed to cancel booking", "error");
    }
  };

  // Update Referral Status (Accept, Submit, Reject)
  const handleUpdateReferral = async (refId, newStatus) => {
    const actionLabel =
      newStatus === "ACCEPTED" ? "accept" :
      newStatus === "SUBMITTED" ? "mark as submitted into company portal" : "decline";

    if (!window.confirm(`Are you sure you want to ${actionLabel} this referral request?`)) return;

    try {
      await updateReferralStatus(refId, newStatus);
      toast$(`Referral request status updated to ${newStatus}`, "success");
      fetchData();
    } catch (err) {
      toast$(err.response?.data?.message || "Failed to update referral", "error");
    }
  };

  // ATS Resume Upload (For reviewing student candidate resume)
  const handleResumeCheck = async (e) => {
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
      e.target.value = "";
    }
  };

  const openReferralReview = (ref) => {
    setReviewReferral(ref);
    setReviewAtsResult(null);
    const student = ref?.studentId || {};
    const url = ref?.resumeUrl || student?.resumeUrl || "";
    const title = `${student?.firstName || "Candidate"} - ${ref?.jobTitle || "Resume"}`;
    setResumeViewerUrl(url);
    setResumeViewerTitle(title);
  };

  const closeReferralReview = () => {
    setReviewReferral(null);
    setReviewAtsResult(null);
    setResumeViewerUrl("");
    setResumeViewerTitle("");
  };

  const openResumeViewer = (url, title = "Candidate Resume") => {
    if (!url) return;
    setResumeViewerUrl(url);
    setResumeViewerTitle(title);
  };

  const handleRunReviewAts = async () => {
    const student = reviewReferral?.studentId || {};
    const targetUrl = reviewReferral?.resumeUrl || student?.resumeUrl || resumeViewerUrl;
    if (!targetUrl) {
      toast$("No resume URL available for this candidate", "error");
      return;
    }
    setReviewAtsLoading(true);
    try {
      const res = await scoreResumeUrl(targetUrl);
      if (res.data?.success) {
        setReviewAtsResult(res.data.data);
        toast$("Applicant resume analyzed successfully with ATS algorithms!", "success");
      }
    } catch (err) {
      toast$(err.response?.data?.message || "Failed to score candidate resume", "error");
    } finally {
      setReviewAtsLoading(false);
    }
  };

  // Metrics
  const pendingReferrals = referrals.filter((r) => r.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

  const seniorName = profile?.firstName || user?.firstName || "Senior Mentor";
  const seniorCompany =
    profile?.companyName ||
    profile?.companyId?.name ||
    (companies.find((c) => (c._id || c.id) === (profile?.companyId?._id || profile?.companyId))?.name) ||
    pForm.companyName ||
    "Company not specified";
  const initials = `${(profile?.firstName || user?.firstName || "S")[0]}${(profile?.lastName || user?.lastName || "M")[0]}`.toUpperCase();

  /* ── Senior Sidebar Navigation ───────────────────────────────────────────── */
  const NAV = [
    { id: "overview",   label: "Overview",            Icon: LayoutDashboard },
    { id: "referrals",  label: "Referral Requests",   Icon: Send, badge: pendingReferrals.length || undefined },
    { id: "interviews", label: "Mock Interviews",     Icon: Calendar, badge: confirmedBookings.length || undefined },
    { id: "profile",    label: "My Senior Profile",   Icon: User },
    { id: "ats",        label: "ATS Resume Review",   Icon: FileText },
  ];

  /* ─────────────────────────── Render Sidebar ────────────────────────────── */
  const renderSidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Brand Header */}
      <div style={{ padding: "18px 16px", borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: T.green, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Code2 size={19} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.text, lineHeight: 1.2 }}>HireLoop</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: "0.06em", textTransform: "uppercase" }}>Senior Portal</div>
          </div>
        </div>
        {/* Close Button on Mobile Drawer */}
        <button
          onClick={() => setSideOpen(false)}
          className="lg:hidden"
          style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 4 }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, padding: "4px 10px 8px" }}>
          Senior Mentorship Menu
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
                <span style={{
                  background: active ? T.green : T.greenLight,
                  color: active ? "#fff" : T.green,
                  borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 800,
                }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Senior Mini Profile Card at Footer */}
      <div style={{ padding: 12, borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 10, background: T.surfaceAlt }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.greenLight, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {seniorName}
            </div>
            <div style={{ fontSize: 11, color: T.green, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile?.designation || "Senior Mentor"}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 4 }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  /* ─────────────────────────── Tab 1: Overview ───────────────────────────── */
  const renderOverview = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Welcome Banner */}
      <div
        className="senior-hero-banner"
        style={{
          background: dark ? "linear-gradient(135deg, #064e3b 0%, #111827 100%)" : "linear-gradient(135deg, #dcfce7 0%, #ffffff 100%)",
          border: `1px solid ${T.border}`, borderRadius: 18, padding: "22px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
        }}
      >
        <div style={{ flex: "1 1 300px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: T.green, color: "#fff", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
            <Briefcase size={12} /> Senior Alumni & Mentor Workspace
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: "0 0 6px" }}>
            Welcome, {seniorName}!
          </h2>
          <p style={{ fontSize: 13, color: T.muted, margin: 0, maxWidth: 540, lineHeight: 1.5 }}>
            Manage student referral requests, conduct 1:1 mock coding interviews, and review candidate resumes.
          </p>
        </div>

        <div className="senior-actions-wrap" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setCreateSlotOpen(true)}
            style={{ background: T.green, color: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <Plus size={16} /> Open Availability Slot
          </button>
          <button
            onClick={() => setTab("referrals")}
            style={{ background: T.hover, border: `1px solid ${T.border}`, color: T.text, borderRadius: 12, padding: "10px 16px", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <Send size={15} color={T.green} /> Review Referrals ({pendingReferrals.length})
          </button>
        </div>
      </div>

      {/* Incomplete Profile Alert Banner (First Time Setup) */}
      {!profile && (
        <div
          style={{
            background: dark ? "rgba(22, 163, 74, 0.12)" : "#ecfdf5",
            border: `1px solid ${dark ? "rgba(22, 163, 74, 0.35)" : "#a7f3d0"}`,
            borderRadius: 16,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: T.greenLight, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                Set up your Senior Mentor Profile
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                Please configure your degree, alma mater, company, and technical domains to activate your senior profile.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setTab("profile");
              setIsEditingProfile(true);
            }}
            style={{
              background: T.green,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "9px 16px",
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Complete Profile Now →
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Pending Referrals</span>
            <div style={{ width: 34, height: 34, background: "#fef3c7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={16} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T.text, marginTop: 8 }}>{pendingReferrals.length}</div>
          <div style={{ fontSize: 11.5, color: "#d97706", fontWeight: 600, marginTop: 4 }}>Awaiting your decision</div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Confirmed Mocks</span>
            <div style={{ width: 34, height: 34, background: "#dbeafe", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={16} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T.text, marginTop: 8 }}>{confirmedBookings.length}</div>
          <div style={{ fontSize: 11.5, color: "#2563eb", fontWeight: 600, marginTop: 4 }}>Upcoming 1:1 sessions</div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Completed Interviews</span>
            <div style={{ width: 34, height: 34, background: "#dcfce7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={16} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T.text, marginTop: 8 }}>{completedBookings.length}</div>
          <div style={{ fontSize: 11.5, color: T.green, fontWeight: 600, marginTop: 4 }}>Students mentored</div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Open Time Slots</span>
            <div style={{ width: 34, height: 34, background: "#ede9fe", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={16} color="#7c3aed" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T.text, marginTop: 8 }}>{mySlots.length}</div>
          <div style={{ fontSize: 11.5, color: "#7c3aed", fontWeight: 600, marginTop: 4 }}>Available to students</div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {/* Left Column: Incoming Pending Referrals */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Send size={16} color={T.green} />
              <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Urgent Referral Requests</span>
            </div>
            <button
              onClick={() => setTab("referrals")}
              style={{ background: "none", border: "none", color: T.green, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          {pendingReferrals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 12px", background: T.surfaceAlt, borderRadius: 12 }}>
              <CheckCircle2 size={26} color={T.green} style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>No pending referral requests</div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>You are all caught up!</div>
            </div>
          ) : (
            pendingReferrals.slice(0, 3).map((r) => (
              <div key={r._id} style={{ padding: 12, background: T.surfaceAlt, borderRadius: 12, marginBottom: 10, border: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>
                      {r.studentId?.firstName} {r.studentId?.lastName || "Student"}
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                      Role: <strong style={{ color: T.text }}>{r.jobTitle}</strong> • {r.companyId?.name || seniorCompany}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: "#fef3c7", color: "#d97706", flexShrink: 0 }}>
                    PENDING
                  </span>
                </div>

                {r.message && (
                  <p style={{ fontSize: 11.5, color: T.muted, margin: "8px 0", background: T.surface, padding: 8, borderRadius: 8, fontStyle: "italic" }}>
                    "{r.message}"
                  </p>
                )}

                {/* Candidate Resume Badge */}
                {(() => {
                  const cResumeUrl = r.resumeUrl || r.studentId?.resumeUrl;
                  const cResumeName = r.resumeFileName || r.studentId?.resumeFileName || "Candidate_Resume.pdf";
                  return cResumeUrl ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", margin: "8px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                        <FileText size={14} color={T.green} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {cResumeName}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => openResumeViewer(cResumeUrl, cResumeName)}
                          style={{ background: "transparent", border: "none", color: T.muted, display: "flex", padding: 2, cursor: "pointer" }}
                          title="View Resume"
                        >
                          <Eye size={13} />
                        </button>
                        <a
                          href={getResumeDownloadUrl(cResumeUrl, cResumeName)}
                          target="_blank"
                          rel="noreferrer"
                          download
                          style={{ color: T.muted, display: "flex", padding: 2 }}
                          title="Download Resume"
                        >
                          <Download size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={() => openReferralReview(r)}
                          style={{ background: "#dcfce7", border: "none", color: "#166534", borderRadius: 6, padding: "3px 8px", fontSize: 10.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                        >
                          <Sparkles size={11} /> Review & ATS
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 10.5, color: T.muted, margin: "6px 0" }}>⚠️ No resume attached</div>
                  );
                })()}

                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleUpdateReferral(r._id, "ACCEPTED")}
                    style={{ flex: "1 1 70px", padding: "6px 8px", borderRadius: 8, background: T.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleUpdateReferral(r._id, "SUBMITTED")}
                    style={{ flex: "1 1 110px", padding: "6px 8px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}
                  >
                    Mark Submitted
                  </button>
                  <button
                    onClick={() => handleUpdateReferral(r._id, "REJECTED")}
                    style={{ padding: "6px 8px", borderRadius: 8, background: "transparent", color: "#ef4444", border: "1px solid #ef4444", fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Upcoming Mock Interviews to Conduct */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={16} color={T.green} />
              <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Upcoming Mock Interviews</span>
            </div>
            <button
              onClick={() => setTab("interviews")}
              style={{ background: "none", border: "none", color: T.green, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          {confirmedBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 12px", background: T.surfaceAlt, borderRadius: 12 }}>
              <Calendar size={26} color={T.muted} style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>No mock interviews scheduled</div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>Open availability slots so students can book you.</div>
              <button
                onClick={() => setCreateSlotOpen(true)}
                style={{ marginTop: 10, background: T.green, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                + Add Availability Slot
              </button>
            </div>
          ) : (
            confirmedBookings.slice(0, 3).map((b) => (
              <div key={b._id} style={{ padding: 12, background: T.surfaceAlt, borderRadius: 12, marginBottom: 10, border: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>
                      {b.studentId?.firstName} {b.studentId?.lastName || "Student"}
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                      {b.slotId?.startTime ? new Date(b.slotId.startTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Scheduled Session"}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: "#dbeafe", color: "#2563eb", flexShrink: 0 }}>
                    CONFIRMED
                  </span>
                </div>

                {b.notes && (
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 6, background: T.surface, padding: 8, borderRadius: 8 }}>
                    Student goals: {b.notes}
                  </div>
                )}

                {b.meetLink && (
                  <div style={{
                    marginTop: 6,
                    padding: "6px 10px",
                    background: dark ? "rgba(37, 99, 235, 0.12)" : "#eff6ff",
                    border: `1px solid ${dark ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe"}`,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Video size={13} color={dark ? "#60a5fa" : "#2563eb"} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "#93c5fd" : "#1e40af" }}>
                        Meet:
                      </span>
                      <span style={{ fontSize: 11, color: dark ? "#bfdbfe" : "#1d4ed8", fontWeight: 500 }}>
                        {b.meetLink}
                      </span>
                    </div>
                    <a
                      href={b.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "#2563eb",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: 10.5,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      Join
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )}

                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setCompleteBooking(b)}
                    style={{ flex: 1, padding: "6px 10px", borderRadius: 8, background: T.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}
                  >
                    Complete & Feedback
                  </button>
                  <button
                    onClick={() => handleCancelBooking(b._id)}
                    style={{ padding: "6px 10px", borderRadius: 8, background: "transparent", color: "#ef4444", border: "1px solid #ef4444", fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  /* ─────────────────────────── Tab 2: Referrals Inbox ────────────────────── */
  const renderReferrals = () => {
    const filtered = referrals.filter((r) => {
      if (referralFilter === "ALL") return true;
      return r.status === referralFilter;
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Header & Filter pills */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: T.text, margin: "0 0 4px" }}>
              Student Referral Requests Inbox
            </h2>
            <div style={{ fontSize: 12, color: T.muted }}>
              Review applicant credentials and approve internal referrals.
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ALL", "PENDING", "ACCEPTED", "SUBMITTED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setReferralFilter(st)}
                style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                  background: referralFilter === st ? T.green : T.surface,
                  color: referralFilter === st ? "#fff" : T.muted,
                  border: `1px solid ${referralFilter === st ? T.green : T.border}`,
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filtered.length === 0 ? (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "36px 16px", textAlign: "center" }}>
            <Send size={30} color={T.muted} style={{ margin: "0 auto 10px" }} />
            <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text }}>No referral requests found</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
              {referralFilter !== "ALL" ? `No requests with status "${referralFilter}".` : "You haven't received any referral requests yet."}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {filtered.map((r) => {
              const student = r.studentId || {};
              const comp = r.companyId || {};
              return (
                <div key={r._id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    {/* Header: Student Info + Status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14.5, color: T.text }}>
                          {student.firstName || "Applicant"} {student.lastName || ""}
                        </div>
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                          {student.college || "College"} • Class of {student.graduationYear || "2026"}
                        </div>
                      </div>

                      <span style={{
                        padding: "2px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 800, flexShrink: 0,
                        background:
                          r.status === "PENDING" ? "#fef3c7" :
                          r.status === "ACCEPTED" ? "#dcfce7" :
                          r.status === "SUBMITTED" ? "#dbeafe" : "#fee2e2",
                        color:
                          r.status === "PENDING" ? "#d97706" :
                          r.status === "ACCEPTED" ? "#16a34a" :
                          r.status === "SUBMITTED" ? "#2563eb" : "#dc2626",
                      }}>
                        {r.status}
                      </span>
                    </div>

                    {/* Role & Company */}
                    <div style={{ marginTop: 12, padding: "10px 12px", background: T.surfaceAlt, borderRadius: 10, border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase" }}>Target Position</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginTop: 2 }}>
                        {r.jobTitle}
                      </div>
                      <div style={{ fontSize: 11.5, color: T.green, fontWeight: 600, marginTop: 2 }}>
                        Company: {comp.name || seniorCompany}
                      </div>

                      {r.jobUrl && (
                        <a
                          href={r.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#2563eb", marginTop: 6, textDecoration: "none", fontWeight: 600 }}
                        >
                          View Job Posting <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    {/* Candidate Pitch */}
                    {r.message && (
                      <div style={{ marginTop: 10, fontSize: 12, color: T.text, background: T.surfaceAlt, padding: 10, borderRadius: 10, borderLeft: `3px solid ${T.green}` }}>
                        <strong style={{ color: T.muted, display: "block", fontSize: 10, textTransform: "uppercase", marginBottom: 2 }}>Applicant Note:</strong>
                        "{r.message}"
                      </div>
                    )}

                    {/* Student Skills */}
                    {student.skills && student.skills.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", marginBottom: 4 }}>Skills:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {student.skills.map((sk, idx) => (
                            <span key={idx} style={{ padding: "2px 7px", borderRadius: 6, background: T.greenLight, color: T.green, fontSize: 10.5, fontWeight: 600 }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Candidate Resume Section */}
                    {(() => {
                      const cResumeUrl = r.resumeUrl || student.resumeUrl;
                      const cResumeName = r.resumeFileName || student.resumeFileName || "Candidate_Resume.pdf";
                      return (
                        <div style={{ marginTop: 12, padding: "10px 12px", background: T.surfaceAlt, borderRadius: 10, border: `1px solid ${T.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                              <FileText size={13} color={T.green} /> Attached Resume (Cloudinary)
                            </div>
                            {cResumeUrl && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "1px 6px", borderRadius: 4 }}>
                                Verified PDF
                              </span>
                            )}
                          </div>

                          {cResumeUrl ? (
                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>
                                {cResumeName}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => openResumeViewer(cResumeUrl, `${student.firstName || "Candidate"} Resume`)}
                                  style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                                >
                                  <Eye size={12} /> View
                                </button>
                                <a
                                  href={getResumeDownloadUrl(cResumeUrl, cResumeName)}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, textDecoration: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}
                                >
                                  <Download size={12} /> Download
                                </a>
                                <button
                                  type="button"
                                  onClick={() => openReferralReview(r)}
                                  style={{ background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 6, padding: "4px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                                >
                                  <Sparkles size={12} /> Review & ATS
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 11.5, color: T.muted }}>
                              No resume attached with this referral request.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {r.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleUpdateReferral(r._id, "ACCEPTED")}
                          style={{ flex: "1 1 70px", padding: "7px 10px", borderRadius: 8, background: T.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateReferral(r._id, "SUBMITTED")}
                          style={{ flex: "1 1 110px", padding: "7px 10px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                        >
                          Mark Submitted
                        </button>
                        <button
                          onClick={() => handleUpdateReferral(r._id, "REJECTED")}
                          style={{ padding: "7px 10px", borderRadius: 8, background: "transparent", color: "#ef4444", border: "1px solid #ef4444", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {r.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleUpdateReferral(r._id, "SUBMITTED")}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                      >
                        ✓ Mark as Submitted in Internal Portal
                      </button>
                    )}

                    {(r.status === "SUBMITTED" || r.status === "REJECTED") && (
                      <div style={{ fontSize: 11.5, color: T.muted, textAlign: "center", width: "100%", fontWeight: 600 }}>
                        Status is finalized ({r.status})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ─────────────────────────── Tab 3: Mock Interviews ────────────────────── */
  const renderInterviews = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Top Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: T.text, margin: "0 0 4px" }}>
            Mock Interview Sessions & Slots
          </h2>
          <div style={{ fontSize: 12, color: T.muted }}>
            Publish availability and conduct 1:1 coding rounds.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: T.surface, padding: 3, borderRadius: 10, border: `1px solid ${T.border}` }}>
            <button
              onClick={() => setInterviewSubTab("sessions")}
              style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, border: "none", cursor: "pointer",
                background: interviewSubTab === "sessions" ? T.green : "transparent",
                color: interviewSubTab === "sessions" ? "#fff" : T.muted,
              }}
            >
              Booked ({bookings.length})
            </button>
            <button
              onClick={() => setInterviewSubTab("slots")}
              style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, border: "none", cursor: "pointer",
                background: interviewSubTab === "slots" ? T.green : "transparent",
                color: interviewSubTab === "slots" ? "#fff" : T.muted,
              }}
            >
              My Slots ({mySlots.length})
            </button>
          </div>

          <button
            onClick={() => setCreateSlotOpen(true)}
            style={{ background: T.green, color: "#fff", border: "none", borderRadius: 10, padding: "7px 14px", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <Plus size={14} /> + Open Slot
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Booked Sessions */}
      {interviewSubTab === "sessions" && (
        <>
          {bookings.length === 0 ? (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "36px 16px", textAlign: "center" }}>
              <Calendar size={30} color={T.muted} style={{ margin: "0 auto 10px" }} />
              <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text }}>No mock interview bookings yet</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                Create availability slots so students can schedule sessions with you.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              {bookings.map((b) => {
                const student = b.studentId || {};
                const slot = b.slotId || {};
                const isConfirmed = b.status === "CONFIRMED";
                return (
                  <div key={b._id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14.5, color: T.text }}>
                          {student.firstName || "Student"} {student.lastName || ""}
                        </div>
                        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>
                          {student.college || "College"} • {student.branch || "Computer Science"}
                        </div>
                      </div>

                      <span style={{
                        padding: "2px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 800, flexShrink: 0,
                        background: isConfirmed ? "#dbeafe" : b.status === "COMPLETED" ? "#dcfce7" : "#fee2e2",
                        color: isConfirmed ? "#2563eb" : b.status === "COMPLETED" ? "#16a34a" : "#dc2626",
                      }}>
                        {b.status}
                      </span>
                    </div>

                    {/* Slot timing */}
                    <div style={{ marginTop: 10, padding: "8px 10px", background: T.surfaceAlt, borderRadius: 10, fontSize: 11.5, display: "flex", alignItems: "center", gap: 6, color: T.text }}>
                      <Clock size={13} color={T.green} />
                      {slot.startTime ? (
                        <span>
                          {new Date(slot.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{" • "}
                          {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : "Scheduled Session"}
                    </div>

                    {/* Student notes */}
                    {b.notes && (
                      <div style={{ marginTop: 8, fontSize: 11.5, color: T.muted, background: T.surfaceAlt, padding: 8, borderRadius: 8 }}>
                        <strong>Student goals:</strong> "{b.notes}"
                      </div>
                    )}

                    {/* Google Meet Link */}
                    {isConfirmed && b.meetLink && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "8px 12px",
                          background: dark ? "rgba(37, 99, 235, 0.12)" : "#eff6ff",
                          border: `1px solid ${dark ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe"}`,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <Video size={14} color={dark ? "#60a5fa" : "#2563eb"} />
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: dark ? "#93c5fd" : "#1e40af" }}>
                            Google Meet:
                          </span>
                          <span style={{ fontSize: 12, color: dark ? "#bfdbfe" : "#1d4ed8", fontWeight: 500, wordBreak: "break-all" }}>
                            {b.meetLink}
                          </span>
                        </div>
                        <a
                          href={b.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: "#2563eb",
                            color: "#ffffff",
                            textDecoration: "none",
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Join Meet
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}

                    {/* Actions */}
                    {isConfirmed && (
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          onClick={() => setCompleteBooking(b)}
                          style={{ flex: 1, padding: "7px 10px", borderRadius: 8, background: T.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                        >
                          Complete & Feedback
                        </button>
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          style={{ padding: "7px 10px", borderRadius: 8, background: "transparent", color: "#ef4444", border: "1px solid #ef4444", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Sub-tab 2: Manage Availability Slots */}
      {interviewSubTab === "slots" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {mySlots.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "36px 16px", textAlign: "center" }}>
              <Clock size={30} color={T.muted} style={{ margin: "0 auto 10px" }} />
              <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text }}>No open availability slots published</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                Click "+ Open Slot" to make yourself available for student mock sessions.
              </div>
            </div>
          ) : (
            mySlots.map((s) => (
              <div key={s._id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: T.text }}>
                    {new Date(s.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <span style={{
                    padding: "2px 7px", borderRadius: 6, fontSize: 10, fontWeight: 800,
                    background: s.status === "AVAILABLE" ? "#dcfce7" : "#dbeafe",
                    color: s.status === "AVAILABLE" ? "#16a34a" : "#2563eb",
                  }}>
                    {s.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                  {new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  /* ─────────────────────────── Tab 4: Senior Profile ─────────────────────── */
  const renderProfile = () => (
    <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Top Banner Card */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)", flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.text }}>{seniorName}</h2>
              <span style={{ fontSize: 10.5, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: T.greenLight, color: T.green }}>
                
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>
              {profile?.designation || "Senior Engineer"} • {profile?.companyName || profile?.companyId?.name || seniorCompany} ({profile?.experienceYears ? `${profile.experienceYears} yrs exp` : "3+ yrs exp"})
            </div>
          </div>
        </div>

        {profile && (
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            style={{ background: isEditingProfile ? T.surfaceAlt : T.green, color: isEditingProfile ? T.text : "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Pencil size={14} />
            {isEditingProfile ? "View Profile Card" : "Edit Profile"}
          </button>
        )}
      </div>

      {/* Read-Only Profile Card */}
      {!isEditingProfile && profile && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Professional Credentials */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Professional Credentials
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 8 }}>
              <div style={{ padding: 12, borderRadius: 10, background: T.surfaceAlt }}>
                <div style={{ fontSize: 11, color: T.muted }}>Current Company</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginTop: 2 }}>{profile.companyName || profile.companyId?.name || seniorCompany}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, background: T.surfaceAlt }}>
                <div style={{ fontSize: 11, color: T.muted }}>Designation</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginTop: 2 }}>{profile.designation || "Senior Software Engineer"}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, background: T.surfaceAlt }}>
                <div style={{ fontSize: 11, color: T.muted }}>Experience</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginTop: 2 }}>{profile.experienceYears ? `${profile.experienceYears} Years` : "3+ Years"}</div>
              </div>
            </div>
          </div>

          {/* Academic Background */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Alumni Academic Background
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 8 }}>
              <div style={{ padding: 12, borderRadius: 10, background: T.surfaceAlt }}>
                <div style={{ fontSize: 11, color: T.muted }}>College</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginTop: 2 }}>{profile.college || "Not specified"}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, background: T.surfaceAlt }}>
                <div style={{ fontSize: 11, color: T.muted }}>Degree & Branch</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginTop: 2 }}>
                  {profile.degree
                    ? profile.branch
                      ? `${profile.degree} - ${profile.branch}`
                      : profile.degree
                    : profile.branch || "Not specified"}
                </div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, background: T.surfaceAlt }}>
                <div style={{ fontSize: 11, color: T.muted }}>Graduation Year</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginTop: 2 }}>{profile.graduationYear || "Not specified"}</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Senior Bio & Mentoring Philosophy
              </div>
              <p style={{ fontSize: 13, color: T.text, lineHeight: 1.6, margin: "6px 0 0", background: T.surfaceAlt, padding: 12, borderRadius: 10 }}>
                {profile.bio}
              </p>
            </div>
          )}

          {/* Technical Domain Expertise */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Domain & Technical Expertise
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {profile.skills?.map((sk, idx) => (
                <span key={idx} style={{ padding: "3px 9px", borderRadius: 8, background: T.greenLight, color: T.green, fontSize: 11.5, fontWeight: 700 }}>
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>
                {profile ? "Update Senior Profile Details" : "Set Up Your Senior Profile"}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                {profile
                  ? "Update your professional credentials, degree details, and mentoring domains."
                  : "Please select your degree, college, employer, and skills so students can connect with you."}
              </div>
            </div>
            {!profile && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: T.greenLight, color: T.green }}>
                First Time Setup
              </span>
            )}
          </div>

          <div className="senior-responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>First Name *</span>
              <input
                value={pForm.firstName}
                onChange={(e) => setPForm({ ...pForm, firstName: e.target.value })}
                required
                style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>Last Name *</span>
              <input
                value={pForm.lastName}
                onChange={(e) => setPForm({ ...pForm, lastName: e.target.value })}
                required
                style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              />
            </label>
          </div>

          <div className="senior-responsive-grid-3" style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 0.8fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>Current Company *</span>
              <input
                list="senior-company-options"
                placeholder="e.g. Google, Microsoft, Amazon, Uber"
                value={pForm.companyName}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = companies.find(
                    (c) => c.name?.toLowerCase() === val.toLowerCase().trim()
                  );
                  setPForm({
                    ...pForm,
                    companyName: val,
                    companyId: matched ? (matched._id || matched.id) : "",
                  });
                }}
                required
                style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              />
              <datalist id="senior-company-options">
                {companies.map((c) => (
                  <option key={c._id || c.id} value={c.name} />
                ))}
              </datalist>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>Designation</span>
              <input
                placeholder="e.g. SDE II / Senior Engineer"
                value={pForm.designation}
                onChange={(e) => setPForm({ ...pForm, designation: e.target.value })}
                style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>Experience (Yrs)</span>
              <input
                type="number"
                min="0"
                max="50"
                placeholder="e.g. 4"
                value={pForm.experienceYears}
                onChange={(e) => setPForm({ ...pForm, experienceYears: e.target.value })}
                style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              />
            </label>
          </div>

          <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Academic Background & Degree Details
            </span>
          </div>

          <div className="senior-responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>College Alma Mater</span>
              <input
                placeholder="e.g. IIT Delhi / BITS Pilani"
                value={pForm.college}
                onChange={(e) => setPForm({ ...pForm, college: e.target.value })}
                style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>Graduation Year</span>
              <input
                type="number"
                placeholder="e.g. 2022"
                value={pForm.graduationYear}
                onChange={(e) => setPForm({ ...pForm, graduationYear: e.target.value })}
                style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              />
            </label>
          </div>

          <div className="senior-responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>Degree / Qualification *</span>
              <select
                value={degreeSelect}
                onChange={(e) => {
                  const val = e.target.value;
                  setDegreeSelect(val);
                  if (val === "Other") {
                    setPForm({ ...pForm, degree: customDegree });
                  } else {
                    setPForm({ ...pForm, degree: val });
                  }
                }}
                style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              >
                <option value="">Select Degree</option>
                {DEGREE_OPTIONS.filter((d) => d !== "Other").map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                <option value="Other">Other (Custom Degree)</option>
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>Branch / Specialization</span>
              <input
                list="senior-branch-suggestions"
                placeholder="e.g. Computer Science (CSE), IT, ECE"
                value={pForm.branch}
                onChange={(e) => setPForm({ ...pForm, branch: e.target.value })}
                style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              />
              <datalist id="senior-branch-suggestions">
                <option value="Computer Science (CSE)" />
                <option value="Information Technology (IT)" />
                <option value="Electronics & Communication (ECE)" />
                <option value="Electrical & Electronics (EEE)" />
                <option value="Artificial Intelligence & ML" />
                <option value="Data Science" />
                <option value="Software Engineering" />
                <option value="Mechanical Engineering" />
                <option value="Civil Engineering" />
              </datalist>
            </label>
          </div>

          {degreeSelect === "Other" && (
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.green }}>Specify Custom Degree Name *</span>
              <input
                placeholder="e.g. B.Arch, M.Des, B.Com, Integrated M.Sc"
                value={customDegree}
                onChange={(e) => {
                  setCustomDegree(e.target.value);
                  setPForm({ ...pForm, degree: e.target.value });
                }}
                required={degreeSelect === "Other"}
                style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.green}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              />
            </label>
          )}

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>Bio & Interview Tips</span>
            <textarea
              rows={3}
              placeholder="Tell students about what qualities you look for when reviewing and referring candidates..."
              value={pForm.bio}
              onChange={(e) => setPForm({ ...pForm, bio: e.target.value })}
              style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
            />
          </label>

          {/* Skills / Domain expertise */}
          <div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>
              Technical Expertise & Domains (Press Enter or Add)
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="e.g. Distributed Systems, System Design, Java, Spring"
                value={pForm.skillInput}
                onChange={(e) => setPForm({ ...pForm, skillInput: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pForm.skillInput.trim()) {
                    e.preventDefault();
                    if (!pForm.skills.includes(pForm.skillInput.trim())) {
                      setPForm({ ...pForm, skills: [...pForm.skills, pForm.skillInput.trim()], skillInput: "" });
                    }
                  }
                }}
                style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
              />
              <button
                type="button"
                onClick={() => {
                  if (pForm.skillInput.trim() && !pForm.skills.includes(pForm.skillInput.trim())) {
                    setPForm({ ...pForm, skills: [...pForm.skills, pForm.skillInput.trim()], skillInput: "" });
                  }
                }}
                style={{ background: T.green, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
              >
                Add
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {pForm.skills.map((sk) => (
                <span key={sk} style={{ padding: "3px 9px", borderRadius: 8, background: T.greenLight, color: T.green, fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  {sk}
                  <X
                    size={12}
                    style={{ cursor: "pointer" }}
                    onClick={() => setPForm({ ...pForm, skills: pForm.skills.filter((s) => s !== sk) })}
                  />
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={pSaving}
              style={{ padding: "10px 20px", borderRadius: 10, background: T.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer", opacity: pSaving ? 0.7 : 1 }}
            >
              {pSaving
                ? (profile ? "Saving..." : "Creating Profile...")
                : (profile ? "Update Senior Profile" : "Create Senior Profile")}
            </button>
            {profile && (
              <button
                type="button"
                onClick={() => {
                  const deg = profile.degree || "";
                  const isStandard = DEGREE_OPTIONS.filter((d) => d !== "Other").includes(deg);
                  setDegreeSelect(isStandard ? deg : deg ? "Other" : "");
                  setCustomDegree(isStandard ? "" : deg);
                  const compName =
                    profile.companyName ||
                    profile.companyId?.name ||
                    (companies.find((c) => (c._id || c.id) === (profile.companyId?._id || profile.companyId))?.name) ||
                    "";
                  setPForm({
                    firstName: profile.firstName || "",
                    lastName: profile.lastName || "",
                    phone: profile.phone || "",
                    companyId: profile.companyId?._id || profile.companyId || "",
                    companyName: compName,
                    designation: profile.designation || "",
                    experienceYears: profile.experienceYears !== undefined ? String(profile.experienceYears) : "",
                    college: profile.college || "",
                    degree: profile.degree || "",
                    branch: profile.branch || "",
                    graduationYear: profile.graduationYear ? String(profile.graduationYear) : "",
                    bio: profile.bio || "",
                    skillInput: "",
                    skills: profile.skills || [],
                  });
                  setIsEditingProfile(false);
                }}
                style={{ padding: "10px 18px", borderRadius: 10, background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );

  /* ─────────────────────────── Tab 5: ATS Resume Checker ─────────────────── */
  const renderATS = () => (
    <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: T.text, margin: "0 0 4px" }}>
          Candidate Resume Evaluator
        </h2>
        <div style={{ fontSize: 12, color: T.muted }}>
          Inspect candidate PDF resumes against ATS tech screening algorithms before submitting your referral.
        </div>
      </div>

      <div style={{ background: T.surface, border: `2px dashed ${T.border}`, borderRadius: 18, padding: "32px 18px", textAlign: "center" }}>
        <FileText size={36} color={T.green} style={{ margin: "0 auto 10px" }} />
        <div style={{ fontWeight: 800, fontSize: 14.5, color: T.text }}>Upload Applicant Resume (PDF)</div>
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 4 }}>Evaluate keyword density, technical alignment, and structure</div>

        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          onChange={handleResumeCheck}
          style={{ display: "none" }}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={atsLoading}
          style={{ marginTop: 14, background: T.green, color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
        >
          {atsLoading ? "Scanning Candidate Resume..." : "Select Resume PDF"}
        </button>
      </div>

      {atsResult && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: T.green, textTransform: "uppercase" }}>Resume Benchmark Result</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.text, marginTop: 2 }}>
                Readiness Score: {atsResult.score} / 100
              </div>
            </div>
            <span style={{ padding: "4px 10px", borderRadius: 20, background: T.greenLight, color: T.green, fontWeight: 800, fontSize: 11.5 }}>
              {atsResult.level || "Strong Candidate"}
            </span>
          </div>

          {atsResult.matchedKeywords && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>
                Matched Industry Keywords ({atsResult.matchedKeywords.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {atsResult.matchedKeywords.map((k) => (
                  <span key={k} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#dcfce7", color: "#166534" }}>{k}</span>
                ))}
              </div>
            </div>
          )}

          {atsResult.missingKeywords && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>
                Recommended Missing Keywords ({atsResult.missingKeywords.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {atsResult.missingKeywords.slice(0, 10).map((k) => (
                  <span key={k} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#fee2e2", color: "#b91c1c" }}>{k}</span>
                ))}
              </div>
            </div>
          )}

          {atsResult.feedback && (
            <div style={{ fontSize: 12.5, color: T.muted, background: T.surfaceAlt, padding: 12, borderRadius: 10 }}>
              {atsResult.feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* Senior Referral Review & Candidate ATS Evaluator Modal */
  const renderReferralReviewModal = () => {
    if (!reviewReferral) return null;
    const student = reviewReferral.studentId || {};
    const comp = reviewReferral.companyId || {};
    const cResumeUrl = reviewReferral.resumeUrl || student.resumeUrl || resumeViewerUrl;
    const cResumeName = reviewReferral.resumeFileName || student.resumeFileName || "Candidate_Resume.pdf";

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, width: "100%", maxWidth: 1060, height: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}>
          {/* Modal Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: T.greenLight, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>
                {(student.firstName?.[0] || "C") + (student.lastName?.[0] || "")}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>
                    {student.firstName || "Applicant"} {student.lastName || ""}
                  </span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 800,
                    background:
                      reviewReferral.status === "PENDING" ? "#fef3c7" :
                      reviewReferral.status === "ACCEPTED" ? "#dcfce7" :
                      reviewReferral.status === "SUBMITTED" ? "#dbeafe" : "#fee2e2",
                    color:
                      reviewReferral.status === "PENDING" ? "#d97706" :
                      reviewReferral.status === "ACCEPTED" ? "#16a34a" :
                      reviewReferral.status === "SUBMITTED" ? "#2563eb" : "#dc2626",
                  }}>
                    {reviewReferral.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                  Applying for <strong style={{ color: T.text }}>{reviewReferral.jobTitle}</strong> at {comp.name || seniorCompany} • {student.college || "University"} (Class of {student.graduationYear || "2026"})
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {cResumeUrl && (
                <a
                  href={getResumeDownloadUrl(cResumeUrl, cResumeName)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.surface, border: `1px solid ${T.border}`, color: T.text, textDecoration: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 700 }}
                >
                  <Download size={13} /> Download Resume
                </a>
              )}
              <button
                type="button"
                onClick={closeReferralReview}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Split Body */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", overflow: "hidden" }}>
            {/* Left: Candidate Resume PDF Viewer */}
            <div style={{ background: "#1e293b", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", background: "#0f172a", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>
                  <FileText size={15} color="#4ade80" /> {cResumeName}
                </div>
                {cResumeUrl && (
                  <a
                    href={getResumeViewUrl(cResumeUrl, cResumeName)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 11, color: "#60a5fa", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    Open Fullscreen <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                {cResumeUrl ? (
                  <object
                    data={getResumeViewUrl(cResumeUrl, cResumeName)}
                    type="application/pdf"
                    style={{ width: "100%", height: "100%", border: "none" }}
                  >
                    <iframe
                      src={getResumeViewUrl(cResumeUrl, cResumeName)}
                      title="Candidate Resume"
                      style={{ width: "100%", height: "100%", border: "none" }}
                    />
                  </object>
                ) : (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", gap: 8 }}>
                    <FileText size={36} />
                    <div>No PDF resume URL found for this candidate</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: ATS Evaluation & Referral Actions */}
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", padding: 22, gap: 16, background: T.surface }}>
              {/* Note / Pitch */}
              {reviewReferral.message && (
                <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", marginBottom: 4 }}>
                    Candidate Pitch / Elevator Note
                  </div>
                  <div style={{ fontSize: 12.5, color: T.text, lineHeight: 1.5 }}>
                    "{reviewReferral.message}"
                  </div>
                </div>
              )}

              {/* Senior ATS Evaluator Panel */}
              <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                      <Sparkles size={15} color={T.green} /> ATS Score Reviewer
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                      Automated keyword match & placement readiness
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={reviewAtsLoading || !cResumeUrl}
                    onClick={handleRunReviewAts}
                    style={{
                      background: T.green, color: "#fff", border: "none", borderRadius: 8,
                      padding: "7px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5, opacity: reviewAtsLoading ? 0.7 : 1,
                    }}
                  >
                    <Sparkles size={12} /> {reviewAtsLoading ? "Evaluating..." : (reviewAtsResult ? "Re-evaluate ATS" : "Run ATS Score")}
                  </button>
                </div>

                {reviewAtsResult ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}` }}>
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase" }}>Benchmark Score</div>
                        <span style={{ fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: reviewAtsResult.score >= 80 ? "#dcfce7" : reviewAtsResult.score >= 60 ? "#fef3c7" : "#fee2e2", color: reviewAtsResult.score >= 80 ? "#166534" : reviewAtsResult.score >= 60 ? "#a16207" : "#b91c1c", marginTop: 4, display: "inline-block" }}>
                          {reviewAtsResult.level || "Evaluated"}
                        </span>
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: reviewAtsResult.score >= 80 ? "#16a34a" : reviewAtsResult.score >= 60 ? "#d97706" : "#dc2626" }}>
                        {reviewAtsResult.score}<span style={{ fontSize: 14, fontWeight: 700, color: T.muted }}>/100</span>
                      </div>
                    </div>

                    {/* Matched Keywords */}
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>
                        Matched Skills & Keywords ({reviewAtsResult.matchedKeywords?.length || 0})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {reviewAtsResult.matchedKeywords?.slice(0, 10).map((k) => (
                          <span key={k} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#dcfce7", color: "#166534" }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    {reviewAtsResult.missingKeywords?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>
                          Missing Keywords to Ask In Interview
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {reviewAtsResult.missingKeywords.slice(0, 8).map((k) => (
                            <span key={k} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#fee2e2", color: "#b91c1c" }}>
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: T.muted, background: T.surface, padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, textAlign: "center" }}>
                    Click "Run ATS Score" to parse candidate resume keywords, sections, and technical fit for <strong>{reviewReferral.jobTitle}</strong>.
                  </div>
                )}
              </div>

              {/* Referral Decision Actions */}
              <div style={{ marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", marginBottom: 8 }}>
                  Senior Referral Decision
                </div>

                {reviewReferral.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateReferral(reviewReferral._id, "ACCEPTED");
                        closeReferralReview();
                      }}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: T.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      Accept Referral
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateReferral(reviewReferral._id, "SUBMITTED");
                        closeReferralReview();
                      }}
                      style={{ flex: 1.2, padding: "10px 12px", borderRadius: 10, background: "#2563eb", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      Mark Submitted in Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateReferral(reviewReferral._id, "REJECTED");
                        closeReferralReview();
                      }}
                      style={{ padding: "10px 12px", borderRadius: 10, background: "transparent", color: "#ef4444", border: "1px solid #ef4444", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      Decline
                    </button>
                  </div>
                )}

                {reviewReferral.status === "ACCEPTED" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateReferral(reviewReferral._id, "SUBMITTED");
                      closeReferralReview();
                    }}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "#2563eb", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >
                    ✓ Mark as Submitted in Internal Portal
                  </button>
                )}

                {(reviewReferral.status === "SUBMITTED" || reviewReferral.status === "REJECTED") && (
                  <div style={{ fontSize: 12.5, color: T.muted, textAlign: "center", fontWeight: 600, padding: 8, background: T.surfaceAlt, borderRadius: 8 }}>
                    Referral request is finalized ({reviewReferral.status})
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* Standalone Resume Document Viewer Modal */
  const renderResumeViewerModal = () => {
    if (!resumeViewerUrl || reviewReferral) return null;
    const viewUrl = getResumeViewUrl(resumeViewerUrl, resumeViewerTitle || "Candidate_Resume.pdf");
    const downloadUrl = getResumeDownloadUrl(resumeViewerUrl, resumeViewerTitle || "Candidate_Resume.pdf");
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, width: "100%", maxWidth: 850, height: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.35)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={18} color={T.green} />
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{resumeViewerTitle || "Candidate Resume"}</div>
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
                onClick={() => setResumeViewerUrl("")}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, background: "#1e293b", position: "relative" }}>
            <object
              data={viewUrl}
              type="application/pdf"
              style={{ width: "100%", height: "100%", border: "none" }}
            >
              <iframe
                src={viewUrl}
                title={resumeViewerTitle || "Candidate Resume"}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </object>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg, color: T.text, fontFamily: "'Figtree', 'Inter', sans-serif" }}>
      {/* Toast Notification */}
      {toast.msg && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 1000,
          background: toast.type === "error" ? "#ef4444" : T.green, color: "#fff",
          padding: "10px 18px", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8,
        }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {renderReferralReviewModal()}
      {renderResumeViewerModal()}

      {/* Desktop Sidebar */}
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

      {/* Mobile Drawer */}
      {sideOpen && (
        <>
          <div
            onClick={() => setSideOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,.5)" }}
          />
          <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 250, maxWidth: "80vw", zIndex: 50, background: T.surface, borderRight: `1px solid ${T.border}`, overflowY: "auto" }}>
            {renderSidebarContent()}
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", minWidth: 0 }}>
        {/* Top Header Bar */}
        <header style={{ height: 58, flexShrink: 0, background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", zIndex: 10 }}>
          {/* Mobile hamburger button */}
          <button
            id="mobile-senior-menu"
            onClick={() => setSideOpen(!sideOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "none", padding: 4 }}
          >
            <Menu size={22} />
          </button>

          {/* Search bar */}
          <div className="senior-header-search" style={{ flex: 1, maxWidth: 400, display: "flex", alignItems: "center", gap: 10, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "7px 12px" }}>
            <Search size={14} color={T.muted} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search referrals, students..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12.5, color: T.text }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: dark ? "#fbbf24" : T.muted }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notification Bell — real-time with unread badge */}
            <NotificationBell token={token} dark={dark} />

            {/* Profile Avatar */}
            <div
              onClick={() => setTab("profile")}
              title="View profile"
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "3px 8px 3px 3px", borderRadius: 20, border: `1px solid ${T.border}`, background: T.surfaceAlt, cursor: "pointer" }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                {initials}
              </div>
              <span className="senior-name-pill" style={{ fontSize: 12, fontWeight: 700, color: T.text, maxWidth: 100, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {seniorName}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body with responsive padding */}
        <main className="senior-main-content" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {tab === "overview" && renderOverview()}
          {tab === "referrals" && renderReferrals()}
          {tab === "interviews" && renderInterviews()}
          {tab === "profile" && renderProfile()}
          {tab === "ats" && renderATS()}
        </main>
      </div>

      {/* Modal 1: Create Slot Modal */}
      {createSlotOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, width: "100%", maxWidth: 420, padding: 20, boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.text }}>+ Open Availability Slot</h3>
              <button onClick={() => setCreateSlotOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateSlot} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>Date *</span>
                <input
                  type="date"
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                  required
                  style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
                />
              </label>

              <div className="senior-responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>Start Time *</span>
                  <input
                    type="time"
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    required
                    style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>End Time *</span>
                  <input
                    type="time"
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    required
                    style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 13 }}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={slotSubmitting}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: T.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
                >
                  {slotSubmitting ? "Publishing..." : "Publish Slot"}
                </button>
                <button
                  type="button"
                  onClick={() => setCreateSlotOpen(false)}
                  style={{ padding: "10px 14px", borderRadius: 10, background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Complete Interview & Notes */}
      {completeBooking && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, width: "100%", maxWidth: 440, padding: 20, boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.text }}>Complete Mock Interview</h3>
              <button onClick={() => setCompleteBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: 12.5, color: T.muted, margin: "0 0 12px" }}>
              Provide feedback and notes for <strong>{completeBooking.studentId?.firstName} {completeBooking.studentId?.lastName}</strong>.
            </p>

            <textarea
              rows={4}
              placeholder="e.g. Strong problem solving in binary trees. Recommended practicing time complexity analysis and live code explanation."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, outline: "none", fontSize: 12.5 }}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={handleCompleteInterview}
                disabled={completingLoading}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: T.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
              >
                {completingLoading ? "Submitting..." : "Submit & Complete"}
              </button>
              <button
                onClick={() => setCompleteBooking(null)}
                style={{ padding: "10px 14px", borderRadius: 10, background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Responsive Mobile Media Styles matching student portal ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .lg\\:block { display: block !important; }
        @media (max-width: 1023px) {
          .lg\\:block { display: none !important; }
          #mobile-senior-menu { display: flex !important; }
        }
        @media (max-width: 640px) {
          .senior-header-search { display: none !important; }
          .senior-main-content { padding: 14px 12px !important; }
          .senior-hero-banner { padding: 16px 14px !important; }
          .senior-name-pill { display: none !important; }
          .senior-responsive-grid-2 { grid-template-columns: 1fr !important; }
          .senior-responsive-grid-3 { grid-template-columns: 1fr !important; }
          .senior-actions-wrap { flex-direction: column !important; width: 100% !important; }
          .senior-actions-wrap button { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}
