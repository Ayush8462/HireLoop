import { companyRepository } from "../respositories/company.repository.js";
import { generateSlug, appendSlugSuffix } from "../utils/slug.js";
import { ApiError } from "../utils/api-error.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";

export interface CreateCompanyInput {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  industry?: string;
  headquarters?: string;
  size?: string;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {}

export class CompanyService {
  async createCompany(authUserId: string, data: CreateCompanyInput) {
    const existing = await companyRepository.findByName(data.name);
    if (existing) {
      throw new ApiError(409, "Company with this name already exists");
    }

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
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new ApiError(404, "Company not found");
    }

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
  }
}

export const companyService = new CompanyService();
