import { Router } from "express";
<<<<<<< HEAD
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
=======
import {
  requestReferral,
  updateReferralStatus,
  getMySentReferrals,
  getMyReceivedReferrals,
} from "../controllers/referral.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  requestReferralSchema,
  updateReferralStatusSchema,
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
} from "../validators/referral.validator.js";

const router = Router();

router.post(
<<<<<<< HEAD
  "/",
=======
  "/request",
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  authenticate,
  validate(requestReferralSchema),
  requestReferral
);
<<<<<<< HEAD

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
=======
router.patch(
  "/:id/status",
  authenticate,
  validate(updateReferralStatusSchema),
  updateReferralStatus
);
router.get("/sent", authenticate, getMySentReferrals);
router.get("/received", authenticate, getMyReceivedReferrals);
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990

export default router;
