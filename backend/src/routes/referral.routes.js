import { Router } from "express";
import { requestReferral, approveReferral, rejectReferral, getSeniorReferrals, getStudentReferrals } from "../controllers/referral.controllers.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
import rolestatus from "../middlewares/role.middleware.js";

const router=Router();

router.post("/request", authMiddleware, requestReferral);
router.put("/approve/:id", authMiddleware, rolestatus("senior"), approveReferral);
router.put("/reject/:id", authMiddleware, rolestatus("senior"), rejectReferral);
router.get("/student", authMiddleware, getStudentReferrals);
router.get("/senior", authMiddleware, getSeniorReferrals);

export default router;