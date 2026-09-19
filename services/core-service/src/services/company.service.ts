<<<<<<< HEAD
import { companyRepository } from "../respositories/company.repository.js";
import { generateSlug, appendSlugSuffix } from "../utils/slug.js";
import { ApiError } from "../utils/api-error.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";

export interface CreateCompanyInput {
=======
import { Types } from "mongoose";
import { companyRepository } from "../respositories/company.repository.js";
import { roadmapRepository } from "../respositories/roadmap.repository.js";
import { ApiError } from "../utils/api-error.js";
import { IRoadmapStage } from "../models/roadmap.model.js";

interface CreateCompanyInput {
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  industry?: string;
  headquarters?: string;
<<<<<<< HEAD
  size?: string;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {}

export class CompanyService {
  async createCompany(authUserId: string, data: CreateCompanyInput) {
=======
}

interface CreateRoadmapInput {
  title: string;
  description?: string;
  stages: IRoadmapStage[];
  isPublished?: boolean;
}

export class CompanyService {
  async createCompany(userId: string, data: CreateCompanyInput) {
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
    const existing = await companyRepository.findByName(data.name);
    if (existing) {
      throw new ApiError(409, "Company with this name already exists");
    }

<<<<<<< HEAD
    let baseSlug = generateSlug(data.name);
    let slug = baseSlug;
    let suffix = 2;
    while (await companyRepository.findSlugExists(slug)) {
      slug = appendSlugSuffix(baseSlug, suffix);
      suffix++;
    }

    return companyRepository.create({
      ...data,
      slug,
      createdBy: authUserId,
      isVerified: false,
    });
  }

  async getCompanies(query: any) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {
      search: query.search,
      industry: query.industry,
      isVerified: query.isVerified,
    };
    
    const [companies, total] = await Promise.all([
      companyRepository.findMany(filter, skip, limit),
      companyRepository.count(filter),
    ]);

    return {
      companies,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  async getCompanyById(id: string) {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new ApiError(404, "Company not found");
    }
    return company;
  }

  async getCompanyBySlug(slug: string) {
    const company = await companyRepository.findBySlug(slug);
    if (!company) {
      throw new ApiError(404, "Company not found");
    }
    return company;
  }

  async updateCompany(authUserId: string, id: string, data: UpdateCompanyInput) {
=======
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

  async getCompanyById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid company ID");
    }

>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new ApiError(404, "Company not found");
    }

<<<<<<< HEAD
    if (company.createdBy !== authUserId) {
      throw new ApiError(403, "You can only update companies you created");
    }

    let slug = company.slug;
    if (data.name && data.name !== company.name) {
      const existing = await companyRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ApiError(409, "Company with this name already exists");
      }

      let baseSlug = generateSlug(data.name);
      slug = baseSlug;
      let suffix = 2;
      while (await companyRepository.findSlugExists(slug)) {
        if (slug === company.slug) break;
        slug = appendSlugSuffix(baseSlug, suffix);
        suffix++;
      }
    }

    const updateData = { ...data, slug };
    const updated = await companyRepository.updateById(id, updateData);
    if (!updated) {
      throw new ApiError(404, "Company not found");
    }
    return updated;
  }

  async verifyCompany(id: string) {
    // Role checks are typically handled at route level or auth context, but verify is admin only
    const updated = await companyRepository.updateById(id, { isVerified: true });
    if (!updated) {
      throw new ApiError(404, "Company not found");
    }
    return updated;
=======
    return company;
  }

  async createRoadmap(
    userId: string,
    companyId: string,
    data: CreateRoadmapInput
  ) {
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

  async getRoadmapByCompanyId(companyId: string) {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new ApiError(400, "Invalid company ID");
    }

    const roadmap = await roadmapRepository.findByCompanyId(companyId);
    if (!roadmap) {
      throw new ApiError(404, "Roadmap not found for this company");
    }

    return roadmap;
  }

  async updateRoadmap(id: string, data: Partial<CreateRoadmapInput>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid roadmap ID");
    }

    const updated = await roadmapRepository.updateById(id, data);
    if (!updated) {
      throw new ApiError(404, "Roadmap not found");
    }

    return updated;
  }

  async deleteRoadmap(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid roadmap ID");
    }

    const deleted = await roadmapRepository.deleteById(id);
    if (!deleted) {
      throw new ApiError(404, "Roadmap not found");
    }

    return { message: "Roadmap deleted successfully" };
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }
}

export const companyService = new CompanyService();
