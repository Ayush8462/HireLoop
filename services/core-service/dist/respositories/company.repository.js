import { Company } from "../models/company.model.js";
export class CompanyRepository {
    async create(data) {
        return Company.create(data);
    }
    async findAll() {
        return Company.find().sort({ name: 1 });
    }
    async findById(id) {
        return Company.findById(id);
    }
    async findByName(name) {
        return Company.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    }
    async findBySlug(slug) {
        return Company.findOne({ slug });
    }
}
export const companyRepository = new CompanyRepository();
//# sourceMappingURL=company.repository.js.map