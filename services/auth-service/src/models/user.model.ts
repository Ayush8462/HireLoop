import {Document, Model, Schema, model} from 'mongoose';

export type UserRole = "user" | "admin" | "senior";

export type UserStatus = "active" | "suspended" | "deleted";


export interface IUser {
  email: string;

  passwordHash: string;

  firstName: string;

  lastName: string;

  role: UserRole;

  status: UserStatus;

  emailVerified: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export type UserDocument = IUser & Document;

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    role: {
      type: String,
      enum: [
        "user",
        "senior",
        "admin",
      ],
      default: "user",
    },

    status: {
      type: String,
      enum: [
        "active",
        "suspended",
        "deleted",
      ],
      default: "active",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<UserDocument> = model<UserDocument>("User",userSchema);