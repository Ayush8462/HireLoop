import { Types } from "mongoose";
import { Roadmap } from "../models/roadmap.model.js";
export class RoadmapRepository {
    async create(data) {
        return Roadmap.create(data);
    }
    async findByCompanyId(companyId) {
        return Roadmap.findOne({
            companyId: new Types.ObjectId(companyId),
        }).populate("companyId");
    }
    async findById(id) {
        return Roadmap.findById(id).populate("companyId");
    }
    async updateById(id, data) {
        return Roadmap.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).populate("companyId");
    }
    async deleteById(id) {
        return Roadmap.findByIdAndDelete(id);
    }
}
export const roadmapRepository = new RoadmapRepository();
//# sourceMappingURL=roadmap.repository.js.map