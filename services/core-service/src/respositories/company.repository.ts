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
  }

  async findByName(name: string): Promise<CompanyDocument | null> {
    return Company.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
  }

  async findBySlug(slug: string): Promise<CompanyDocument | null> {
    return Company.findOne({ slug });
  }
}

export const companyRepository = new CompanyRepository();
