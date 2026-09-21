import { Router } from "express";
import { authProxy } from "../proxy/auth.proxy.js";
import { coreProxy } from "../proxy/core.proxy.js";
import { atsProxy } from "../proxy/ats.proxy.js";
import { notificationProxy } from "../proxy/notification.proxy.js";
import { chatbotProxy } from "../proxy/chatbot.proxy.js";

const router = Router();

// Auth Service
router.use(authProxy);

// ATS Service
router.use(atsProxy);

// Notification Service (in-app notifications)
router.use(notificationProxy);
// Chatbot AI Agent Service
router.use(chatbotProxy);

// Core Service (Profiles, Companies, Roadmaps, Referrals, Interviews)
router.use(coreProxy);

export default router;