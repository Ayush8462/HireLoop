import { Router } from "express";
import { authProxy } from "../proxy/auth.proxy.js";
import { coreProxy } from "../proxy/core.proxy.js";
import { atsProxy } from "../proxy/ats.proxy.js";

const router = Router();

// Auth Service
router.use("/api/auth", authProxy);
router.use("/api/v1/auth", authProxy);

// Core Service (Profiles, Companies, Roadmaps, Referrals, Interviews)
router.use("/api/profiles", coreProxy);
router.use("/api/companies", coreProxy);
router.use("/api/referrals", coreProxy);
router.use("/api/interviews", coreProxy);

// ATS Service
router.use("/api/ats", atsProxy);

export default router;