import { Router } from "express";
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
} from "../validators/company.validator.js";

const router = Router();

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

export default router;
