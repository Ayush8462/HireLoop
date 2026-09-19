import {
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
} from "mongoose";

export enum InterviewSlotStatus {
  AVAILABLE = "AVAILABLE",
  BOOKED = "BOOKED",
  CANCELLED = "CANCELLED",
}

export interface IInterviewSlot {
  seniorId: Types.ObjectId;

  startTime: Date;
  endTime: Date;

  status: InterviewSlotStatus;

  createdAt: Date;
  updatedAt: Date;
}

export type InterviewSlotDocument =
  HydratedDocument<IInterviewSlot>;

const interviewSlotSchema = new Schema<IInterviewSlot>(
  {
    seniorId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    startTime: {
      type: Date,
      required: true,
      index: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(InterviewSlotStatus),
      required: true,
      default: InterviewSlotStatus.AVAILABLE,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

interviewSlotSchema.index({
  seniorId: 1,
  startTime: 1,
});

interviewSlotSchema.index({
  seniorId: 1,
  status: 1,
  startTime: 1,
});

export const InterviewSlot: Model<IInterviewSlot> =
  model<IInterviewSlot>(
    "InterviewSlot",
    interviewSlotSchema,
  );