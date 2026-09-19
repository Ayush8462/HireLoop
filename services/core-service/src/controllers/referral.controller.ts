<<<<<<< HEAD
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { sendSuccess, sendPaginated } from "../utils/api-response.js";
import { referralService } from "../services/referral.service.js";

export const requestReferral = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await referralService.requestReferral(req.user!.userId, req.body as any);
  sendSuccess(res, result, 201);
});

export const getSentReferrals = asyncHandler(async (req: Request, res: Response) => {
  const result = await referralService.getSentReferrals(req.user!.userId, req.query);
  sendPaginated(res, result.items, result.pagination, 200);
});

export const getReceivedReferrals = asyncHandler(async (req: Request, res: Response) => {
  const result = await referralService.getReceivedReferrals(req.user!.userId, req.query);
  sendPaginated(res, result.items, result.pagination, 200);
});

export const getReferralById = asyncHandler(async (req: Request, res: Response) => {
  const result = await referralService.getReferralById(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, result, 200);
});

export const acceptReferral = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = req.body as any;
  const result = await referralService.acceptReferral(
    req.user!.userId,
    req.params["id"] as string,
    body.responseMessage as string | undefined,
  );
  sendSuccess(res, result, 200);
});

export const rejectReferral = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = req.body as any;
  const result = await referralService.rejectReferral(
    req.user!.userId,
    req.params["id"] as string,
    body.responseMessage as string | undefined,
  );
  sendSuccess(res, result, 200);
});

export const cancelReferral = asyncHandler(async (req: Request, res: Response) => {
  const result = await referralService.cancelReferral(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, result, 200);
=======
import { Request, Response, RequestHandler } from "express";
import { referralService } from "../services/referral.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ReferralStatus } from "../models/referral.model.js";

export const requestReferral: RequestHandler = asyncHandler(async (req, res) => {
  const referral = await referralService.requestReferral(
    req.user!.userId,
    req.body
  );
  sendSuccess(res, referral, 201);
});

export const updateReferralStatus: RequestHandler = asyncHandler(async (req, res) => {
  const referral = await referralService.updateStatus(
    req.user!.userId,
    String(req.params.id),
    req.body.status as ReferralStatus
  );
  sendSuccess(res, referral);
});

export const getMySentReferrals: RequestHandler = asyncHandler(async (req, res) => {
  const status = req.query.status as ReferralStatus | undefined;
  const referrals = await referralService.getMySentReferrals(
    req.user!.userId,
    status
  );
  sendSuccess(res, referrals);
});

export const getMyReceivedReferrals: RequestHandler = asyncHandler(async (req, res) => {
  const status = req.query.status as ReferralStatus | undefined;
  const referrals = await referralService.getMyReceivedReferrals(
    req.user!.userId,
    status
  );
  sendSuccess(res, referrals);
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
});
