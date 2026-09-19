<<<<<<< HEAD
import { Types } from "mongoose";
import type { QueryFilter } from "mongoose";
import { Company, CompanyDocument, ICompany } from "../models/company.model.js";

export interface CompanyFilter {
  search?: string;
  industry?: string;
  isVerified?: boolean;
}

export class CompanyRepository {
  async create(data: Partial<ICompany>): Promise<CompanyDocument> {
    return Company.create(data);
  }

  async findById(id: string): Promise<CompanyDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Company.findById(id);
  }

  async findBySlug(slug: string): Promise<CompanyDocument | null> {
    return Company.findOne({ slug });
=======
import { Company, CompanyDocument, ICompany } from "../models/company.model.js";

export class CompanyRepository {
  async create(data: Omit<ICompany, "createdAt" | "updatedAt">): Promise<CompanyDocument> {
    return Company.create(data);
  }

  async findAll(): Promise<CompanyDocument[]> {
    return Company.find().sort({ name: 1 });
  }

  async findById(id: string): Promise<CompanyDocument | null> {
    return Company.findById(id);
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }

  async findByName(name: string): Promise<CompanyDocument | null> {
    return Company.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
  }

<<<<<<< HEAD
  async findSlugExists(slug: string): Promise<boolean> {
    const count = await Company.countDocuments({ slug });
    return count > 0;
  }

  async findMany(filter: CompanyFilter, skip: number, limit: number): Promise<CompanyDocument[]> {
    const query = this.buildQuery(filter);
    return Company.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  async count(filter: CompanyFilter): Promise<number> {
    const query = this.buildQuery(filter);
    return Company.countDocuments(query);
  }

  async updateById(id: string, data: Partial<ICompany>): Promise<CompanyDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Company.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  private buildQuery(filter: CompanyFilter): QueryFilter<ICompany> {
    const query: QueryFilter<ICompany> = {};
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        { slug: { $regex: filter.search, $options: "i" } }
      ];
    }
    if (filter.industry) {
      query.industry = filter.industry;
    }
    if (filter.isVerified !== undefined) {
      query.isVerified = filter.isVerified;
    }
    return query;
=======
  async findBySlug(slug: string): Promise<CompanyDocument | null> {
    return Company.findOne({ slug });
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }
}

export const companyRepository = new CompanyRepository();
