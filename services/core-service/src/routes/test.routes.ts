import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { sendSuccess } from "../utils/api-response.js";


const router = Router();

router.get(
    "/me",
    authenticate,
    asyncHandler(async (req,res)=>{
        sendSuccess(res, {user: req.user})
    })
)

export default router;