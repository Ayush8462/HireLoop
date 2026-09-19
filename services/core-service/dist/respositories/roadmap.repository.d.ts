import { RoadmapDocument, IRoadmap } from "../models/roadmap.model.js";
export declare class RoadmapRepository {
    create(data: Omit<IRoadmap, "createdAt" | "updatedAt">): Promise<RoadmapDocument>;
    findByCompanyId(companyId: string): Promise<RoadmapDocument | null>;
    findById(id: string): Promise<RoadmapDocument | null>;
    updateById(id: string, data: Partial<IRoadmap>): Promise<RoadmapDocument | null>;
    deleteById(id: string): Promise<RoadmapDocument | null>;
}
export declare const roadmapRepository: RoadmapRepository;
