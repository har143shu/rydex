import mongoose, { Document, Schema } from "mongoose";

// 1. TypeScript Interface (Data ka structure define karne ke liye)
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "partner" | "admin";
  isUserVerified?: boolean;
  partnerOnBoardingSteps: number;
  mobileNumber?: string;
  otp?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Mongoose Schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "partner", "admin"],
    },
    isUserVerified: {
      type: Boolean,
      default: false,
    },
    partnerOnBoardingSteps: {
      type: Number,
      min: 0,
      max: 8,
      default: 0,
    },
    mobileNumber: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// 3. Next.js Specific Check (Jo sabse zaroori hai!)
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
