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
