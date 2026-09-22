import { Request, Response, RequestHandler } from "express";

import { profileService } from "../services/profile.service.js";

import { sendSuccess } from "../utils/api-response.js";

import { asyncHandler } from "../middlewares/async-handler.js";

export const createProfile: RequestHandler = asyncHandler(async (req, res) => {
  const profile = await profileService.createProfile(
    req.user!.userId,
    req.user!.role,
    req.body,
  );

  sendSuccess(res, profile, 201);
});

export const getMyProfile: RequestHandler = asyncHandler(async (req, res) => {
  const profile = await profileService.getMyProfile(req.user!.userId);

  sendSuccess(res, profile);
});

export const getProfileById = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const profile = await profileService.getProfileById(req.params.id);

    sendSuccess(res, profile);
  },
);

export const updateMyProfile: RequestHandler = asyncHandler(
  async (req, res) => {
    const profile = await profileService.updateMyProfile(
      req.user!.userId,
      req.body,
    );

    sendSuccess(res, profile);
  },
);

export const uploadMyResume: RequestHandler = asyncHandler(
  async (req, res) => {
    const result = await profileService.uploadResume(
      req.user!.userId,
      req.file as Express.Multer.File,
    );

    sendSuccess(res, result, 200);
  },
);

export const viewResumeFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUrl = req.query.url as string;
    const fileName = (req.query.name as string) || "Resume.pdf";
    if (!targetUrl) {
      res.status(400).send("Resume URL is required");
      return;
    }

    let buffer: Buffer;
    if (targetUrl.startsWith("data:application/pdf;base64,")) {
      const base64Data = targetUrl.replace("data:application/pdf;base64,", "");
      buffer = Buffer.from(base64Data, "base64");
    } else if (targetUrl.startsWith("blob:")) {
      res.status(400).send("Browser blob URLs are local to the client and cannot be fetched by the server");
      return;
    } else {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        res.status(404).send("Could not retrieve resume from storage");
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    res.removeHeader("X-Frame-Options");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName.replace(/"/g, "")}"`);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send("Error loading resume: " + (err.message || "Unknown error"));
  }
};

export const downloadResumeFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUrl = req.query.url as string;
    const fileName = (req.query.name as string) || "Resume.pdf";
    if (!targetUrl) {
      res.status(400).send("Resume URL is required");
      return;
    }

    let buffer: Buffer;
    if (targetUrl.startsWith("data:application/pdf;base64,")) {
      const base64Data = targetUrl.replace("data:application/pdf;base64,", "");
      buffer = Buffer.from(base64Data, "base64");
    } else if (targetUrl.startsWith("blob:")) {
      res.status(400).send("Browser blob URLs are local to the client and cannot be fetched by the server");
      return;
    } else {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        res.status(404).send("Could not retrieve resume from storage");
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName.replace(/"/g, "")}"`);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send("Error downloading resume: " + (err.message || "Unknown error"));
  }
};

export const getSeniors: RequestHandler = async (req, res, next) => {
  try {
    const companyId = req.query.companyId as string | undefined;
    const seniors = await profileService.getSeniors(companyId);
    res.status(200).json({
      success: true,
      data: seniors,
    });
  } catch (error) {
    next(error);
  }
};

