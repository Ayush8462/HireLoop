import { HydratedDocument, Model, Schema, model } from "mongoose";

export interface ICompany {
  name: string;
  slug: string;

  logo?: string;
  website?: string;
  description?: string;
  industry?: string;

  headquarters?: string;

  createdBy: string;

  createdAt: Date;
  updatedAt: Date;
}

export type CompanyDocument = HydratedDocument<ICompany>;

const companySchema = new Schema<ICompany>(
  {
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Company: Model<ICompany> = model<ICompany>(
  "Company",
  companySchema,
);