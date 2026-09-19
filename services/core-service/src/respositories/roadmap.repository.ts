import { Types } from "mongoose";
import { Roadmap, RoadmapDocument, IRoadmap } from "../models/roadmap.model.js";

export class RoadmapRepository {
  async create(data: Omit<IRoadmap, "createdAt" | "updatedAt">): Promise<RoadmapDocument> {
    return Roadmap.create(data);
  }

  async findByCompanyId(companyId: string): Promise<RoadmapDocument | null> {
    return Roadmap.findOne({
      companyId: new Types.ObjectId(companyId),
    }).populate("companyId");
  }

  async findById(id: string): Promise<RoadmapDocument | null> {
    return Roadmap.findById(id).populate("companyId");
  }

  async updateById(
    id: string,
    data: Partial<IRoadmap>
  ): Promise<RoadmapDocument | null> {
    return Roadmap.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("companyId");
  }

  async deleteById(id: string): Promise<RoadmapDocument | null> {
    return Roadmap.findByIdAndDelete(id);
  }
}

export const roadmapRepository = new RoadmapRepository();
