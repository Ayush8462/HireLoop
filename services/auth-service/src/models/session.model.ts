import {Document, Model, Schema, model, Types} from 'mongoose';


export interface ISession{
    userId: Types.ObjectId;

    refreshTokenHash?: string;

    expiresAt: Date;

    createdAt: Date;

    updatedAt: Date;
}

export type SessionDocument = ISession & Document;

const sessionSchema = new Schema<SessionDocument>(
    {
        userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      refreshTokenHash: {
        type: String,
        required: false,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },
    },
    {
        timestamps: true,
    }
)

export const SessionModel: Model<SessionDocument> = model<SessionDocument>("Session", sessionSchema);