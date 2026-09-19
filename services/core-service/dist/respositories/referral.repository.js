import { Referral, ReferralStatus, } from "../models/referral.model.js";
export class ReferralRepository {
    async create(data) {
        return Referral.create(data);
    }
    async findById(id) {
        return Referral.findById(id)
            .populate("studentId")
            .populate("seniorId")
            .populate("companyId");
    }
    async countTodayByStudentId(studentId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Referral.countDocuments({
            studentId,
            createdAt: { $gte: today },
        });
    }
    async findExistingPending(studentId, seniorId, companyId, jobTitle) {
        return Referral.findOne({
            studentId,
            seniorId,
            companyId,
            jobTitle: { $regex: new RegExp(`^${jobTitle}$`, "i") },
            status: ReferralStatus.PENDING,
        });
    }
    async findByStudentId(studentId, status) {
        const query = { studentId };
        if (status)
            query.status = status;
        return Referral.find(query)
            .sort({ createdAt: -1 })
            .populate("seniorId")
            .populate("companyId");
    }
    async findBySeniorId(seniorId, status) {
        const query = { seniorId };
        if (status)
            query.status = status;
        return Referral.find(query)
            .sort({ createdAt: -1 })
            .populate("studentId")
            .populate("companyId");
    }
    async updateStatus(id, status) {
        return Referral.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
            .populate("studentId")
            .populate("seniorId")
            .populate("companyId");
    }
}
export const referralRepository = new ReferralRepository();
//# sourceMappingURL=referral.repository.js.map