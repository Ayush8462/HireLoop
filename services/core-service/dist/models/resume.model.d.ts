import { HydratedDocument, Model, Types } from "mongoose";
export interface IResume {
    studentId: Types.ObjectId;
    fileName: string;
    fileUrl: string;
    version: number;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type ResumeDocument = HydratedDocument<IResume>;
export declare const Resume: Model<IResume>;
