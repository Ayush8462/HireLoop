import { HydratedDocument, Model, Types } from "mongoose";
export interface IRoadmapResource {
    title: string;
    url: string;
    type?: string;
}
export interface IRoadmapTopic {
    title: string;
    description?: string;
    resources: IRoadmapResource[];
}
export interface IRoadmapStage {
    title: string;
    description?: string;
    order: number;
    topics: IRoadmapTopic[];
}
export interface IRoadmap {
    companyId: Types.ObjectId;
    title: string;
    description?: string;
    createdBy: string;
    stages: IRoadmapStage[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type RoadmapDocument = HydratedDocument<IRoadmap>;
export declare const Roadmap: Model<IRoadmap>;
