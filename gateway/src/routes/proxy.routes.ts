import { Router } from "express";
import { authProxy } from "../proxy/auth.proxy.js";
import { coreProxy } from "../proxy/core.proxy.js";
import { atsProxy } from "../proxy/ats.proxy.js";

const router = Router();

// Auth Service
router.use(authProxy);

// ATS Service
router.use(atsProxy);

// Core Service (Profiles, Companies, Roadmaps, Referrals, Interviews)
router.use(coreProxy);

export default router;