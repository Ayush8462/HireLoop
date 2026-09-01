import {Router} from "express";
import {authProxy} from "../proxy/auth.proxy.js";


const router = Router();

router.use("/api/auth",authProxy);

export default router;