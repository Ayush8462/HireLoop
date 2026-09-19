import { companyService } from "../services/company.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../middlewares/async-handler.js";
export const createCompany = asyncHandler(async (req, res) => {
    const company = await companyService.createCompany(req.user.userId, req.body);
    sendSuccess(res, company, 201);
});
export const getAllCompanies = asyncHandler(async (_req, res) => {
    const companies = await companyService.getAllCompanies();
    sendSuccess(res, companies);
});
export const getCompanyById = asyncHandler(async (req, res) => {
    const company = await companyService.getCompanyById(String(req.params.id));
    sendSuccess(res, company);
});
export const createRoadmap = asyncHandler(async (req, res) => {
    const roadmap = await companyService.createRoadmap(req.user.userId, String(req.params.companyId), req.body);
    sendSuccess(res, roadmap, 201);
});
export const getRoadmapByCompanyId = asyncHandler(async (req, res) => {
    const roadmap = await companyService.getRoadmapByCompanyId(String(req.params.companyId));
    sendSuccess(res, roadmap);
});
export const updateRoadmap = asyncHandler(async (req, res) => {
    const roadmap = await companyService.updateRoadmap(String(req.params.id), req.body);
    sendSuccess(res, roadmap);
});
export const deleteRoadmap = asyncHandler(async (req, res) => {
    const result = await companyService.deleteRoadmap(String(req.params.id));
    sendSuccess(res, result);
});
//# sourceMappingURL=company.controller.js.map