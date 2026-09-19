import { CompanyDocument, ICompany } from "../models/company.model.js";
export declare class CompanyRepository {
    create(data: Omit<ICompany, "createdAt" | "updatedAt">): Promise<CompanyDocument>;
    findAll(): Promise<CompanyDocument[]>;
    findById(id: string): Promise<CompanyDocument | null>;
    findByName(name: string): Promise<CompanyDocument | null>;
    findBySlug(slug: string): Promise<CompanyDocument | null>;
}
export declare const companyRepository: CompanyRepository;
