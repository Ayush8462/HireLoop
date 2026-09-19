<<<<<<< HEAD
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { sendSuccess, sendPaginated } from "../utils/api-response.js";
import { companyService } from "../services/company.service.js";

export const createCompany = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await companyService.createCompany(req.user!.userId, req.body as any);
  sendSuccess(res, result, 201);
});

export const getCompanies = asyncHandler(async (req: Request, res: Response) => {
  const result = await companyService.getCompanies(req.query);
  sendPaginated(res, result.companies, result.pagination, 200);
});

export const getCompanyById = asyncHandler(async (req: Request, res: Response) => {
  const result = await companyService.getCompanyById(req.params["id"] as string);
  sendSuccess(res, result, 200);
});

export const getCompanyBySlug = asyncHandler(async (req: Request, res: Response) => {
  const result = await companyService.getCompanyBySlug(req.params["slug"] as string);
  sendSuccess(res, result, 200);
});

export const updateCompany = asyncHandler(async (req: Request, res: Response) => {
  const result = await companyService.updateCompany(
    req.user!.userId,
    req.params["id"] as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.body as any,
  );
  sendSuccess(res, result, 200);
});

export const verifyCompany = asyncHandler(async (req: Request, res: Response) => {
  const result = await companyService.verifyCompany(req.params["id"] as string);
  sendSuccess(res, result, 200);
=======
import { Request, Response, RequestHandler } from "express";
import { companyService } from "../services/company.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../middlewares/async-handler.js";

export const createCompany: RequestHandler = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(
    req.user!.userId,
    req.body
  );
  sendSuccess(res, company, 201);
});

export const getAllCompanies: RequestHandler = asyncHandler(async (_req, res) => {
  const companies = await companyService.getAllCompanies();
  sendSuccess(res, companies);
});

export const getCompanyById: RequestHandler = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(String(req.params.id));
  sendSuccess(res, company);
});

export const createRoadmap: RequestHandler = asyncHandler(async (req, res) => {
  const roadmap = await companyService.createRoadmap(
    req.user!.userId,
    String(req.params.companyId),
    req.body
  );
  sendSuccess(res, roadmap, 201);
});

export const getRoadmapByCompanyId: RequestHandler = asyncHandler(async (req, res) => {
  const roadmap = await companyService.getRoadmapByCompanyId(String(req.params.companyId));
  sendSuccess(res, roadmap);
});

export const updateRoadmap: RequestHandler = asyncHandler(async (req, res) => {
  const roadmap = await companyService.updateRoadmap(String(req.params.id), req.body);
  sendSuccess(res, roadmap);
});

export const deleteRoadmap: RequestHandler = asyncHandler(async (req, res) => {
  const result = await companyService.deleteRoadmap(String(req.params.id));
  sendSuccess(res, result);
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
});
