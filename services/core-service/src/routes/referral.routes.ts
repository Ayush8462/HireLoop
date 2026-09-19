import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  requestReferral,
  getSentReferrals,
  getReceivedReferrals,
  getReferralById,
  acceptReferral,
  rejectReferral,
  cancelReferral,
} from "../controllers/referral.controller.js";
import {
  requestReferralSchema,
  referralIdSchema,
  acceptRejectReferralSchema,
  paginationQuerySchema,
} from "../validators/referral.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(requestReferralSchema),
  requestReferral
);

router.get(
  "/sent",
  authenticate,
  validate(paginationQuerySchema),
  getSentReferrals
);

router.get(
  "/received",
  authenticate,
  validate(paginationQuerySchema),
  getReceivedReferrals
);

router.get(
  "/:id",
  authenticate,
  validate(referralIdSchema),
  getReferralById
);

router.patch(
  "/:id/accept",
  authenticate,
  validate(acceptRejectReferralSchema),
  acceptReferral
);

router.patch(
  "/:id/reject",
  authenticate,
  validate(acceptRejectReferralSchema),
  rejectReferral
);

router.patch(
  "/:id/cancel",
  authenticate,
  validate(referralIdSchema),
  cancelReferral
);

export default router;
