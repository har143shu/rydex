import mongoose, { Document, Schema } from "mongoose";

type VideoKycStatus =
  | "not_required"
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected";

// 1. TypeScript Interface (Data ka structure define karne ke liye)
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "partner" | "admin";
  isUserVerified?: boolean;
  partnerOnBoardingSteps: number;
  videoKycStatus: VideoKycStatus;
  videoKycRoomId?: string;
  videoKycRejectionReason?: string;
  partnerStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  mobileNumber?: string;
  socketId:string | null;
  location?:{
      type:"Point",
      coordinates:[number,number]
  };
  isOnline:boolean;
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
    videoKycStatus: {
      type: String,
      enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
      default: "not_required",
    },
    videoKycRoomId: {
      type: String,
    },
    videoKycRejectionReason: {
      type: String,
    },
    partnerStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
    rejectionReason: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    socketId: {
      type: String,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
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

userSchema.index({ location: "2dsphere" });
// 3. Next.js Specific Check (Jo sabse zaroori hai!)
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
