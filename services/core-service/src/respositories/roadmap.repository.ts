import { Types } from "mongoose";
<<<<<<< HEAD
import type { QueryFilter } from "mongoose";
import { Roadmap, RoadmapDocument, IRoadmap } from "../models/roadmap.model.js";

export interface RoadmapFilter {
  companyId?: string;
  isPublished?: boolean;
  createdBy?: string;
}

export class RoadmapRepository {
  async create(data: Partial<IRoadmap>): Promise<RoadmapDocument> {
    return Roadmap.create(data);
  }

  async findById(id: string): Promise<RoadmapDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Roadmap.findById(id);
  }

  async findMany(filter: RoadmapFilter, skip: number, limit: number): Promise<RoadmapDocument[]> {
    const query = this.buildQuery(filter);
    return Roadmap.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  async count(filter: RoadmapFilter): Promise<number> {
    const query = this.buildQuery(filter);
    return Roadmap.countDocuments(query);
  }

  async updateById(id: string, data: Partial<IRoadmap>): Promise<RoadmapDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Roadmap.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await Roadmap.findByIdAndDelete(id);
  }

  private buildQuery(filter: RoadmapFilter): QueryFilter<IRoadmap> {
    const query: QueryFilter<IRoadmap> = {};
    if (filter.companyId) {
      query.companyId = filter.companyId;
    }
    if (filter.isPublished !== undefined) {
      query.isPublished = filter.isPublished;
    }
    if (filter.createdBy) {
      query.createdBy = filter.createdBy;
    }
    return query;
=======
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
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }
}

export const roadmapRepository = new RoadmapRepository();
