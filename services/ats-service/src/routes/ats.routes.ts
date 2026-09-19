import { Router, Request, Response } from "express";
import multer from "multer";
import { scoreText, uploadAndScoreResume } from "../controllers/ats.controller.js";

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

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, service: "ats-service", status: "healthy" });
});

router.post("/score", scoreText);

router.post("/upload", upload.single("resume"), uploadAndScoreResume);

export default router;
