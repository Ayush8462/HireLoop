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
});
