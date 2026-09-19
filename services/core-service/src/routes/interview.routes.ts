import { Router } from "express";
import {
  createSlot,
  getAvailableSlots,
  bookInterview,
  completeInterview,
  cancelInterview,
  getStudentHistory,
  getSeniorHistory,
  getInterviewStats,
} from "../controllers/interview.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createSlotSchema,
  bookInterviewSchema,
} from "../validators/interview.validator.js";

const router = Router();

router.post("/slots", authenticate, validate(createSlotSchema), createSlot);
router.get("/slots", authenticate, getAvailableSlots);

router.post("/book", authenticate, validate(bookInterviewSchema), bookInterview);
router.patch("/bookings/:id/complete", authenticate, completeInterview);
router.patch("/bookings/:id/cancel", authenticate, cancelInterview);

router.get("/student/history", authenticate, getStudentHistory);
router.get("/senior/history", authenticate, getSeniorHistory);
router.get("/stats", authenticate, getInterviewStats);

export default router;
