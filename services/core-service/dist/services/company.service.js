import { Types } from "mongoose";
import { companyRepository } from "../respositories/company.repository.js";
import { roadmapRepository } from "../respositories/roadmap.repository.js";
import { ApiError } from "../utils/api-error.js";
export class CompanyService {
    async createCompany(userId, data) {
        const existing = await companyRepository.findByName(data.name);
        if (existing) {
            throw new ApiError(409, "Company with this name already exists");
        }
        const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        return companyRepository.create({
            name: data.name,
            slug,
            logo: data.logo,
            website: data.website,
            description: data.description,
            industry: data.industry,
            headquarters: data.headquarters,
            createdBy: userId,
        });
    }
    async getAllCompanies() {
        return companyRepository.findAll();
    }
    async getCompanyById(id) {
        if (!Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid company ID");
        }
        const company = await companyRepository.findById(id);
        if (!company) {
            throw new ApiError(404, "Company not found");
        }
        return company;
    }
    async createRoadmap(userId, companyId, data) {
        if (!Types.ObjectId.isValid(companyId)) {
            throw new ApiError(400, "Invalid company ID");
        }
        const company = await companyRepository.findById(companyId);
        if (!company) {
            throw new ApiError(404, "Company not found");
        }
        const existing = await roadmapRepository.findByCompanyId(companyId);
        if (existing) {
            throw new ApiError(409, "Roadmap already exists for this company");
        }
        return roadmapRepository.create({
            companyId: new Types.ObjectId(companyId),
            title: data.title,
            description: data.description,
            stages: data.stages,
            isPublished: data.isPublished ?? true,
            createdBy: userId,
        });
    }
    async getRoadmapByCompanyId(companyId) {
        if (!Types.ObjectId.isValid(companyId)) {
            throw new ApiError(400, "Invalid company ID");
        }
        const roadmap = await roadmapRepository.findByCompanyId(companyId);
        if (!roadmap) {
            throw new ApiError(404, "Roadmap not found for this company");
        }
        return roadmap;
    }
    async updateRoadmap(id, data) {
        if (!Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid roadmap ID");
        }
        const updated = await roadmapRepository.updateById(id, data);
        if (!updated) {
            throw new ApiError(404, "Roadmap not found");
        }
        return updated;
    }
    async deleteRoadmap(id) {
        if (!Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid roadmap ID");
        }
        const deleted = await roadmapRepository.deleteById(id);
        if (!deleted) {
            throw new ApiError(404, "Roadmap not found");
        }
        return { message: "Roadmap deleted successfully" };
    }
}
export const companyService = new CompanyService();
//# sourceMappingURL=company.service.js.map