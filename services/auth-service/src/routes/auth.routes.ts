import {Router} from "express";
import { login, register, refresh, logout, getInternalUserEmail } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login",login)
router.post("/refresh",refresh)
router.post("/logout",logout)

// Internal route — called only by notification-service (protected by x-internal-secret)
router.get("/internal/user-email/:authUserId", getInternalUserEmail);

export default router;