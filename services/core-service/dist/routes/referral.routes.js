import { Router } from "express";
import { requestReferral, updateReferralStatus, getMySentReferrals, getMyReceivedReferrals, } from "../controllers/referral.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requestReferralSchema, updateReferralStatusSchema, } from "../validators/referral.validator.js";
const router = Router();
router.post("/request", authenticate, validate(requestReferralSchema), requestReferral);
router.patch("/:id/status", authenticate, validate(updateReferralStatusSchema), updateReferralStatus);
router.get("/sent", authenticate, getMySentReferrals);
router.get("/received", authenticate, getMyReceivedReferrals);
export default router;
//# sourceMappingURL=referral.routes.js.map