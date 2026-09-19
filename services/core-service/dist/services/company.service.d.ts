import { Types } from "mongoose";
import { IRoadmapStage } from "../models/roadmap.model.js";
interface CreateCompanyInput {
    name: string;
    logo?: string;
    website?: string;
    description?: string;
    industry?: string;
    headquarters?: string;
}
interface CreateRoadmapInput {
    title: string;
    description?: string;
    stages: IRoadmapStage[];
    isPublished?: boolean;
}
export declare class CompanyService {
    createCompany(userId: string, data: CreateCompanyInput): Promise<import("mongoose").Document<unknown, {}, import("../models/company.model.js").ICompany, {}, import("mongoose").DefaultSchemaOptions> & import("../models/company.model.js").ICompany & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    getAllCompanies(): Promise<(import("mongoose").Document<unknown, {}, import("../models/company.model.js").ICompany, {}, import("mongoose").DefaultSchemaOptions> & import("../models/company.model.js").ICompany & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getCompanyById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/company.model.js").ICompany, {}, import("mongoose").DefaultSchemaOptions> & import("../models/company.model.js").ICompany & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    createRoadmap(userId: string, companyId: string, data: CreateRoadmapInput): Promise<import("mongoose").Document<unknown, {}, import("../models/roadmap.model.js").IRoadmap, {}, import("mongoose").DefaultSchemaOptions> & import("../models/roadmap.model.js").IRoadmap & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    getRoadmapByCompanyId(companyId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/roadmap.model.js").IRoadmap, {}, import("mongoose").DefaultSchemaOptions> & import("../models/roadmap.model.js").IRoadmap & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    updateRoadmap(id: string, data: Partial<CreateRoadmapInput>): Promise<import("mongoose").Document<unknown, {}, import("../models/roadmap.model.js").IRoadmap, {}, import("mongoose").DefaultSchemaOptions> & import("../models/roadmap.model.js").IRoadmap & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteRoadmap(id: string): Promise<{
        message: string;
    }>;
}
export declare const companyService: CompanyService;
export {};
