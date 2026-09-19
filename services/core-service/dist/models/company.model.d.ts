import { HydratedDocument, Model } from "mongoose";
export interface ICompany {
    name: string;
    slug: string;
    logo?: string;
    website?: string;
    description?: string;
    industry?: string;
    headquarters?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export type CompanyDocument = HydratedDocument<ICompany>;
export declare const Company: Model<ICompany>;
