<<<<<<< HEAD
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createSlot,
  getAvailableSlots,
  updateSlot,
  deleteSlot,
  bookSlot,
  getStudentBookings,
  getSeniorBookings,
  getBookingById,
  cancelBooking,
  completeBooking
} from '../controllers/interview.controller.js';
import {
  createSlotSchema,
  updateSlotSchema,
  slotIdSchema,
  bookSlotSchema,
  bookingIdSchema,
  getSlotsSchema,
  getBookingsSchema
} from '../validators/interview.validator.js';

const router = Router();

// Slot routes
router.post('/slots', authenticate, validate(createSlotSchema), createSlot);
router.get('/slots', authenticate, validate(getSlotsSchema), getAvailableSlots);
router.patch('/slots/:id', authenticate, validate(updateSlotSchema), updateSlot);
router.delete('/slots/:id', authenticate, validate(slotIdSchema), deleteSlot);

// Booking routes
router.post('/bookings', authenticate, validate(bookSlotSchema), bookSlot);
router.get('/bookings/student', authenticate, validate(getBookingsSchema), getStudentBookings);
router.get('/bookings/senior', authenticate, validate(getBookingsSchema), getSeniorBookings);
router.get('/bookings/:id', authenticate, validate(bookingIdSchema), getBookingById);
router.patch('/bookings/:id/cancel', authenticate, validate(bookingIdSchema), cancelBooking);
router.patch('/bookings/:id/complete', authenticate, validate(bookingIdSchema), completeBooking);
=======
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
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990

export default router;
