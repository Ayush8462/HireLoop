import { Router } from "express";
import verifyToken from "../middlewares/auth.middlewares.js";
import { createProfile, getProfile, updateProfile } from "../controllers/profile.controller.js";

const router = Router();

router.post("/create", verifyToken, createProfile);
router.get("/me", verifyToken, getProfile);
router.put("update", verifyToken, updateProfile);

export default router;