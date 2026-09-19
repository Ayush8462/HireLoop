import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { sendSuccess, sendPaginated } from "../utils/api-response.js";
import { resumeService } from "../services/resume.service.js";

export const createResume = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await resumeService.createResume(req.user!.userId, req.body as any);
  sendSuccess(res, result, 201);
});

export const getMyResumes = asyncHandler(async (req: Request, res: Response) => {
  const result = await resumeService.getMyResumes(req.user!.userId, req.query);
  sendPaginated(res, result.items, result.pagination);
});

export const getResumeById = asyncHandler(async (req: Request, res: Response) => {
  const result = await resumeService.getResumeById(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, result);
});

export const updateResume = asyncHandler(async (req: Request, res: Response) => {
  const result = await resumeService.updateResume(
    req.user!.userId,
    req.params["id"] as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.body as any,
  );
  sendSuccess(res, result);
});

export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
  await resumeService.deleteResume(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, null, 204);
});

export const setDefaultResume = asyncHandler(async (req: Request, res: Response) => {
  const result = await resumeService.setDefaultResume(req.user!.userId, req.params["id"] as string);
  sendSuccess(res, result);
});
