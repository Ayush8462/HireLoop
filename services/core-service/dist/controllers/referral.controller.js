import { referralService } from "../services/referral.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../middlewares/async-handler.js";
export const requestReferral = asyncHandler(async (req, res) => {
    const referral = await referralService.requestReferral(req.user.userId, req.body);
    sendSuccess(res, referral, 201);
});
export const updateReferralStatus = asyncHandler(async (req, res) => {
    const referral = await referralService.updateStatus(req.user.userId, String(req.params.id), req.body.status);
    sendSuccess(res, referral);
});
export const getMySentReferrals = asyncHandler(async (req, res) => {
    const status = req.query.status;
    const referrals = await referralService.getMySentReferrals(req.user.userId, status);
    sendSuccess(res, referrals);
});
export const getMyReceivedReferrals = asyncHandler(async (req, res) => {
    const status = req.query.status;
    const referrals = await referralService.getMyReceivedReferrals(req.user.userId, status);
    sendSuccess(res, referrals);
});
//# sourceMappingURL=referral.controller.js.map