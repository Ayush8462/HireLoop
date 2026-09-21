import { Router } from "express";
import { authProxy } from "../proxy/auth.proxy.js";
import { coreProxy } from "../proxy/core.proxy.js";
import { atsProxy } from "../proxy/ats.proxy.js";
import { notificationProxy } from "../proxy/notification.proxy.js";

const router = Router();

// Auth Service
router.use(authProxy);

// ATS Service
router.use(atsProxy);

// Notification Service (in-app notifications)
router.use(notificationProxy);

// Core Service (Profiles, Companies, Roadmaps, Referrals, Interviews)
router.use(coreProxy);

export default router;