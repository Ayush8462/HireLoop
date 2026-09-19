import { Router } from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  createRoadmap,
  getRoadmapByCompanyId,
  updateRoadmap,
  deleteRoadmap,
} from "../controllers/company.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCompanySchema,
  createRoadmapSchema,
  updateRoadmapSchema,
} from "../validators/company.validator.js";

const router = Router();

router.get("/", getAllCompanies);
router.post("/", authenticate, validate(createCompanySchema), createCompany);
router.get("/:id", getCompanyById);

router.post(
  "/:companyId/roadmaps",
  authenticate,
  validate(createRoadmapSchema),
  createRoadmap
);
router.get("/:companyId/roadmaps", getRoadmapByCompanyId);
router.patch(
  "/roadmaps/:id",
  authenticate,
  validate(updateRoadmapSchema),
  updateRoadmap
);
router.delete("/roadmaps/:id", authenticate, deleteRoadmap);

export default router;
