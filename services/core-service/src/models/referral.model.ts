import {
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
} from "mongoose";

export enum ReferralStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  SUBMITTED = "SUBMITTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface IReferral {
  studentId: Types.ObjectId;
  seniorId: Types.ObjectId;
  companyId: Types.ObjectId;

  jobTitle: string;
  jobUrl?: string;

  message?: string;

  status: ReferralStatus;

  createdAt: Date;
  updatedAt: Date;
}

export type ReferralDocument = HydratedDocument<IReferral>;

const referralSchema = new Schema<IReferral>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    seniorId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    jobUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: Object.values(ReferralStatus),
      required: true,
      default: ReferralStatus.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

referralSchema.index({
  studentId: 1,
  companyId: 1,
  status: 1,
});

referralSchema.index({
  seniorId: 1,
  status: 1,
});

export const Referral: Model<IReferral> = model<IReferral>(
  "Referral",
  referralSchema,
);