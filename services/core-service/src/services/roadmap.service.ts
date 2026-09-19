import { roadmapRepository } from "../respositories/roadmap.repository.js";
import { companyRepository } from "../respositories/company.repository.js";
import { profileRepository } from "../respositories/profile.repository.js";
import { ApiError } from "../utils/api-error.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { ProfileRole } from "../models/profile.model.js";
import { Types } from "mongoose";

export interface CreateRoadmapInput {
  companyId: string;
  title: string;
  description?: string;
  stages: any[];
}

export interface UpdateRoadmapInput extends Partial<CreateRoadmapInput> {
  isPublished?: boolean;
}

export class RoadmapService {
  async createRoadmap(authUserId: string, data: CreateRoadmapInput) {
    const callerProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!callerProfile) {
      throw new ApiError(404, "Profile not found. Create a profile first.");
    }
    if (callerProfile.role !== ProfileRole.SENIOR) {
      throw new ApiError(403, "Only seniors can create roadmaps");
    }

    const company = await companyRepository.findById(data.companyId);
    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    return roadmapRepository.create({
      ...data,
      companyId: new Types.ObjectId(data.companyId),
      createdBy: authUserId,
      isPublished: false,
    });
  }

  async getRoadmaps(query: any, authUserId?: string) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {
      companyId: query.companyId,
      isPublished: true, 
    };
    
    const [roadmaps, total] = await Promise.all([
      roadmapRepository.findMany(filter, skip, limit),
      roadmapRepository.count(filter),
    ]);

    return {
      roadmaps,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  async getRoadmapById(id: string, authUserId?: string) {
    const roadmap = await roadmapRepository.findById(id);
    if (!roadmap) {
      throw new ApiError(404, "Roadmap not found");
    }

    if (!roadmap.isPublished) {
      if (!authUserId || roadmap.createdBy !== authUserId) {
        throw new ApiError(403, "This roadmap is not published");
      }
    }

    return roadmap;
  }

  async updateRoadmap(authUserId: string, id: string, data: UpdateRoadmapInput) {
    const roadmap = await roadmapRepository.findById(id);
    if (!roadmap) {
      throw new ApiError(404, "Roadmap not found");
    }

    if (roadmap.createdBy !== authUserId) {
      throw new ApiError(403, "You can only update roadmaps you created");
    }

    if (data.companyId) {
      const company = await companyRepository.findById(data.companyId);
      if (!company) {
        throw new ApiError(404, "Company not found");
      }
    }

    const updateData: any = { ...data };
    if (data.companyId) updateData.companyId = new Types.ObjectId(data.companyId);

    const updated = await roadmapRepository.updateById(id, updateData);
    if (!updated) {
      throw new ApiError(404, "Roadmap not found");
    }
    return updated;
  }

  async deleteRoadmap(authUserId: string, id: string) {
    const roadmap = await roadmapRepository.findById(id);
    if (!roadmap) {
      throw new ApiError(404, "Roadmap not found");
    }

    if (roadmap.createdBy !== authUserId) {
      throw new ApiError(403, "You can only delete roadmaps you created");
    }

    await roadmapRepository.deleteById(id);
  }
}

export const roadmapService = new RoadmapService();
