import { Router } from "express";

import {
  createProfile,
  getMyProfile,
  getProfileById,
  updateMyProfile,
} from "../controllers/profile.controller.js";

import {
  authenticate,
} from "../middlewares/auth.middleware.js";

import {
  validate,
} from "../middlewares/validate.middleware.js";

import {
  createProfileSchema,
  updateProfileSchema,
  profileIdSchema,
} from "../validators/profile.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createProfileSchema),
  createProfile,
);

router.get(
  "/me",
  authenticate,
  getMyProfile,
);

router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  updateMyProfile,
);

router.get(
  "/:id",
  authenticate,
  validate(profileIdSchema),
  getProfileById,
);

export default router;