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
});
