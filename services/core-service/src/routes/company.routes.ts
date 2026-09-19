import { Router } from "express";
<<<<<<< HEAD
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  getCompanyBySlug,
  updateCompany,
} from "../controllers/company.controller.js";
import {
  createCompanySchema,
  updateCompanySchema,
  companyIdSchema,
  companySlugSchema,
  getCompaniesSchema,
=======
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
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
} from "../validators/company.validator.js";

const router = Router();

<<<<<<< HEAD
router.post("/", authenticate, validate(createCompanySchema), createCompany);
router.get("/", validate(getCompaniesSchema), getCompanies);
router.get("/slug/:slug", validate(companySlugSchema), getCompanyBySlug);
router.get("/:id", validate(companyIdSchema), getCompanyById);
router.patch("/:id", authenticate, validate(updateCompanySchema), updateCompany);

router.patch("/:id/verify", authenticate, validate(companyIdSchema), (_req, res) => {
  res.status(403).json({
    success: false,
    message: "Company verification requires admin privileges",
    code: "FORBIDDEN",
  });
});
=======
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
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990

export default router;
