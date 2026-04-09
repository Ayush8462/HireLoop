import { Router } from "express";
import verifyToken from "../middlewares/auth.middlewares.js";
import { requestReferral } from "../controllers/referral.controllers.js";
import { approveReferral} from "../controllers/referral.controllers.js";
import { rejectReferral} from "../controllers/referral.controllers.js";
import { getSeniorReferrals } from "../controllers/referral.controllers.js";
import { getStudentReferrals } from "../controllers/referral.controllers.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
import { rolestatus } from "../middlewares/role.middleware.js";

const router=Router();

router.post("/request",verifyToken,requestReferral);
router.put("/approve/:id", authMiddleware, rolestatus("senior"), approveReferral);
router.put("/reject/:id", authMiddleware, rolestatus("senior"), rejectReferral);
router.get("/student", authMiddleware, getStudentReferrals);
router.get("/senior", authMiddleware, getSeniorReferrals);

export default router;