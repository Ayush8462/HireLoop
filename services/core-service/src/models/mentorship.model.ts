import {
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
} from "mongoose";

export enum MentorshipStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface IMentorship {
  studentId: Types.ObjectId;
  seniorId: Types.ObjectId;

  message?: string;

  status: MentorshipStatus;

  startedAt?: Date;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type MentorshipDocument = HydratedDocument<IMentorship>;

const mentorshipSchema = new Schema<IMentorship>(
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

    message: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: Object.values(MentorshipStatus),
      required: true,
      default: MentorshipStatus.PENDING,
      index: true,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

mentorshipSchema.index({
  studentId: 1,
  seniorId: 1,
});

mentorshipSchema.index({
  seniorId: 1,
  status: 1,
});

export const Mentorship: Model<IMentorship> =
  model<IMentorship>("Mentorship", mentorshipSchema);