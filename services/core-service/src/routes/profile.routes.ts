import { Router } from "express";

import multer from "multer";

import {
  createProfile,
  getMyProfile,
  getProfileById,
  updateMyProfile,
  uploadMyResume,
  viewResumeFile,
  downloadResumeFile,
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are supported"));
    }
  },
});

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

router.post(
  "/me/resume",
  authenticate,
  upload.single("resume"),
  uploadMyResume,
);

router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  updateMyProfile,
);

router.get(
  "/resume/view",
  viewResumeFile,
);

router.get(
  "/resume/download",
  downloadResumeFile,
);

router.get(
  "/:id",
  authenticate,
  validate(profileIdSchema),
  getProfileById,
);

export default router;