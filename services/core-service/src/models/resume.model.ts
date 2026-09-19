import {
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
} from "mongoose";

export interface IResume {
  studentId: Types.ObjectId;

  fileName: string;
  fileUrl: string;

  version: number;

  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type ResumeDocument = HydratedDocument<IResume>;

const resumeSchema = new Schema<IResume>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },

    version: {
      type: Number,
      required: true,
      min: 1,
    },

    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

resumeSchema.index({
  studentId: 1,
  version: 1,
});

resumeSchema.index({
  studentId: 1,
  isDefault: 1,
});

export const Resume: Model<IResume> = model<IResume>(
  "Resume",
  resumeSchema,
);