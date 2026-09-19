import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { sendSuccess, sendPaginated } from "../utils/api-response.js";
import { mentorshipService } from "../services/mentorship.service.js";

export const sendMentorshipRequest = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await mentorshipService.sendRequest(req.user!.userId, req.body as any);
  sendSuccess(res, result, 201);
});

export const getSentRequests = asyncHandler(async (req: Request, res: Response) => {
  const result = await mentorshipService.getSentRequests(req.user!.userId, req.query);
  sendPaginated(res, result.items, result.pagination, 200);
});

export const getReceivedRequests = asyncHandler(async (req: Request, res: Response) => {
  const result = await mentorshipService.getReceivedRequests(req.user!.userId, req.query);
  sendPaginated(res, result.items, result.pagination, 200);
});

export const acceptRequest = asyncHandler(async (req: Request, res: Response) => {
  const result = await mentorshipService.acceptRequest(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, result, 200);
});

export const rejectRequest = asyncHandler(async (req: Request, res: Response) => {
  const result = await mentorshipService.rejectRequest(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, result, 200);
});

export const cancelRequest = asyncHandler(async (req: Request, res: Response) => {
  const result = await mentorshipService.cancelRequest(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, result, 200);
});

export const getConnections = asyncHandler(async (req: Request, res: Response) => {
  const result = await mentorshipService.getConnections(req.user!.userId, req.query);
  sendPaginated(res, result.items, result.pagination, 200);
});
