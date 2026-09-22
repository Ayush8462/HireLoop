import { Router } from "express";
import { internalAuth } from "../middlewares/internal-auth.middleware.js";
import {
  handleReferralEvent,
  handleInterviewConfirmed,
  handleSlotCreated,
} from "../controllers/internal.controller.js";

const router = Router();

// All internal routes require the x-internal-secret header
router.use(internalAuth);

router.post("/referral-event", handleReferralEvent);
router.post("/interview-confirmed", handleInterviewConfirmed);
router.post("/slot-created", handleSlotCreated);

export default router;
