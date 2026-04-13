import { Router } from "express";
import verifyToken from "../middlewares/auth.middlewares.js";
import rolestatus from "../middlewares/role.middleware.js";
import { createCompany, createRoadmap, deleteRoadmap, getRoadmap, updateRoadmap } from "../controllers/company.controllers.js";

const router = Router();

router.post("/create", verifyToken, rolestatus("admin"), createCompany);
router.post("/roadmap/create", verifyToken, rolestatus("admin"), createRoadmap);
router.put("/roadmap/:id", verifyToken, rolestatus("admin"), updateRoadmap);
router.delete("/roadmap/:id", verifyToken, rolestatus("admin"), deleteRoadmap);
router.get("/roadmap/:companyId", verifyToken, getRoadmap);

export default router;