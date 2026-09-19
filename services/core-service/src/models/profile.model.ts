import { HydratedDocument, Model, Schema, Types, model } from "mongoose";

export enum ProfileRole {
  STUDENT = "STUDENT",
  SENIOR = "SENIOR",
}

export interface IProfile {
  authUserId: string;

  role: ProfileRole;

  firstName: string;
  lastName: string;

  username?: string;
  bio?: string;
  phone?: string;
  avatar?: string;

  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;

  companyId?: Types.ObjectId;
  designation?: string;
  experienceYears?: number;

  skills: string[];

  createdAt: Date;
  updatedAt: Date;
}

export type ProfileDocument = HydratedDocument<IProfile>;

const profileSchema = new Schema<IProfile>(
  {
    authUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    role: {
      type: String,
      enum: Object.values(ProfileRole),
      required: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    avatar: {
      type: String,
      trim: true,
      maxlength: 2048,
    },

    college: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    degree: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    branch: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    graduationYear: {
      type: Number,
      min: 1950,
      max: 2100,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },

    designation: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    experienceYears: {
      type: Number,
      min: 0,
      max: 100,
    },

    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

profileSchema.index(
  { username: 1 },
  {
    unique: true,
    sparse: true,
  },
);

profileSchema.index({
  role: 1,
  companyId: 1,
});

export const Profile: Model<IProfile> = model<IProfile>(
  "Profile",
  profileSchema,
);