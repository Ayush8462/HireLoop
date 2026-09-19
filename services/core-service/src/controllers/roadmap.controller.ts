import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { sendSuccess, sendPaginated } from "../utils/api-response.js";
import { roadmapService } from "../services/roadmap.service.js";

export const createRoadmap = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await roadmapService.createRoadmap(req.user!.userId, req.body as any);
  sendSuccess(res, result, 201);
});

export const getRoadmaps = asyncHandler(async (req: Request, res: Response) => {
  const result = await roadmapService.getRoadmaps(req.query, req.user?.userId);
  sendPaginated(res, result.roadmaps, result.pagination, 200);
});

export const getRoadmapById = asyncHandler(async (req: Request, res: Response) => {
  const result = await roadmapService.getRoadmapById(req.params["id"] as string, req.user?.userId);
  sendSuccess(res, result, 200);
});

export const updateRoadmap = asyncHandler(async (req: Request, res: Response) => {
  const result = await roadmapService.updateRoadmap(
    req.user!.userId,
    req.params["id"] as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.body as any,
  );
  sendSuccess(res, result, 200);
});

export const deleteRoadmap = asyncHandler(async (req: Request, res: Response) => {
  await roadmapService.deleteRoadmap(req.user!.userId, req.params["id"] as string);
  res.status(204).send();
});
