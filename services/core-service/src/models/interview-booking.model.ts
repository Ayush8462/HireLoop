import {
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
} from "mongoose";

export enum InterviewBookingStatus {
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export interface IInterviewBooking {
  slotId: Types.ObjectId;

  studentId: Types.ObjectId;
  seniorId: Types.ObjectId;

  status: InterviewBookingStatus;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type InterviewBookingDocument =
  HydratedDocument<IInterviewBooking>;

const interviewBookingSchema =
  new Schema<IInterviewBooking>(
    {
      slotId: {
        type: Schema.Types.ObjectId,
        ref: "InterviewSlot",
        required: true,
        unique: true,
        index: true,
      },

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

      status: {
        type: String,
        enum: Object.values(InterviewBookingStatus),
        required: true,
        default: InterviewBookingStatus.CONFIRMED,
        index: true,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    },
  );

interviewBookingSchema.index({
  studentId: 1,
  status: 1,
});

interviewBookingSchema.index({
  seniorId: 1,
  status: 1,
});

export const InterviewBooking: Model<IInterviewBooking> =
  model<IInterviewBooking>(
    "InterviewBooking",
    interviewBookingSchema,
  );