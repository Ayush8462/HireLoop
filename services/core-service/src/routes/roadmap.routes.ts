import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateRoadmap,
  deleteRoadmap,
} from "../controllers/roadmap.controller.js";
import {
  createRoadmapSchema,
  updateRoadmapSchema,
  roadmapIdSchema,
  getRoadmapsSchema,
} from "../validators/roadmap.validator.js";

const router = Router();

router.post("/", authenticate, validate(createRoadmapSchema), createRoadmap);
router.get("/", validate(getRoadmapsSchema), getRoadmaps);
router.get("/:id", validate(roadmapIdSchema), getRoadmapById);
router.patch("/:id", authenticate, validate(updateRoadmapSchema), updateRoadmap);
router.delete("/:id", authenticate, validate(roadmapIdSchema), deleteRoadmap);

export default router;
