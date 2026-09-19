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
});
