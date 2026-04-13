import express from "express";
import authMiddleware from "../middlewares/auth.middlewares.js";
import upload from "../middlewares/upload.middleware.js";
import  uploadResume  from "../controllers/resume.controller.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

export default router;