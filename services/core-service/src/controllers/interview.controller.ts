<<<<<<< HEAD
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { sendSuccess, sendPaginated } from "../utils/api-response.js";
import { interviewService } from "../services/interview.service.js";
import { InterviewBookingStatus } from "../models/interview-booking.model.js";

export const createSlot = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await interviewService.createSlot(req.user!.userId, req.body as any);
  sendSuccess(res, result, 201);
});

export const getAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewService.getAvailableSlots(req.query);
  sendPaginated(res, result.items, result.pagination);
});

export const updateSlot = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewService.updateSlot(
    req.user!.userId,
    req.params["id"] as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.body as any,
  );
  sendSuccess(res, result);
});

export const deleteSlot = asyncHandler(async (req: Request, res: Response) => {
  await interviewService.deleteSlot(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, null, 204);
});

export const bookSlot = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await interviewService.bookSlot(req.user!.userId, req.body as any);
  sendSuccess(res, result, 201);
});

export const getStudentBookings = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewService.getStudentBookings(req.user!.userId, req.query);
  sendPaginated(res, result.items, result.pagination);
});

export const getSeniorBookings = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewService.getSeniorBookings(req.user!.userId, req.query);
  sendPaginated(res, result.items, result.pagination);
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewService.getBookingById(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, result);
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  await interviewService.cancelBooking(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, { message: "Booking cancelled successfully" });
});

export const completeBooking = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewService.completeBooking(
    req.user!.userId,
    req.params["id"] as string,
    InterviewBookingStatus.COMPLETED,
  );
  sendSuccess(res, result);
=======
import { Request, Response, RequestHandler } from "express";
import { interviewService } from "../services/interview.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../middlewares/async-handler.js";

export const createSlot: RequestHandler = asyncHandler(async (req, res) => {
  const slot = await interviewService.createSlot(req.user!.userId, req.body);
  sendSuccess(res, slot, 201);
});

export const getAvailableSlots: RequestHandler = asyncHandler(async (req, res) => {
  const seniorId = typeof req.query.seniorId === "string" ? req.query.seniorId : undefined;
  const slots = await interviewService.getAvailableSlots(seniorId);
  sendSuccess(res, slots);
});

export const bookInterview: RequestHandler = asyncHandler(async (req, res) => {
  const booking = await interviewService.bookInterview(
    req.user!.userId,
    req.body
  );
  sendSuccess(res, booking, 201);
});

export const completeInterview: RequestHandler = asyncHandler(async (req, res) => {
  const booking = await interviewService.completeInterview(
    req.user!.userId,
    String(req.params.id),
    req.body.notes
  );
  sendSuccess(res, booking);
});

export const cancelInterview: RequestHandler = asyncHandler(async (req, res) => {
  const booking = await interviewService.cancelInterview(
    req.user!.userId,
    String(req.params.id)
  );
  sendSuccess(res, booking);
});

export const getStudentHistory: RequestHandler = asyncHandler(async (req, res) => {
  const history = await interviewService.getMyStudentHistory(req.user!.userId);
  sendSuccess(res, history);
});

export const getSeniorHistory: RequestHandler = asyncHandler(async (req, res) => {
  const history = await interviewService.getMySeniorHistory(req.user!.userId);
  sendSuccess(res, history);
});

export const getInterviewStats: RequestHandler = asyncHandler(async (_req, res) => {
  const stats = await interviewService.getStats();
  sendSuccess(res, stats);
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
});
