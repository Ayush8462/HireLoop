import { profileService } from "../services/profile.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../middlewares/async-handler.js";
export const createProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.createProfile(req.user.userId, req.user.role, req.body);
    sendSuccess(res, profile, 201);
});
export const getMyProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.getMyProfile(req.user.userId);
    sendSuccess(res, profile);
});
export const getProfileById = asyncHandler(async (req, res) => {
    const profile = await profileService.getProfileById(req.params.id);
    sendSuccess(res, profile);
});
export const updateMyProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.updateMyProfile(req.user.userId, req.body);
    sendSuccess(res, profile);
});
//# sourceMappingURL=profile.controller.js.map