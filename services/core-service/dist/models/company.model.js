import { Schema, model } from "mongoose";
const companySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 150,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
        minlength: 2,
        maxlength: 150,
    },
    logo: {
        type: String,
        trim: true,
        maxlength: 2048,
    },
    website: {
        type: String,
        trim: true,
        maxlength: 2048,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 3000,
    },
    industry: {
        type: String,
        trim: true,
        maxlength: 150,
    },
    headquarters: {
        type: String,
        trim: true,
        maxlength: 200,
    },
    createdBy: {
        type: String,
        required: true,
        index: true,
        trim: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
export const Company = model("Company", companySchema);
//# sourceMappingURL=company.model.js.map