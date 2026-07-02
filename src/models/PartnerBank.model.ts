import mongoose, { Document } from "mongoose";

export interface IPartnerBank extends Document{
  owner: mongoose.Types.ObjectId;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  upi?: string;
  status: "not_added" | "added" | "verified";
  createdAt: Date;
  updatedAt: Date;
}

const partnerBankSchema = new mongoose.Schema<IPartnerBank>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountHolder: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    ifsc: {
      type: String,
      required: true,
      uppercase: true,
    },
    upi: String,

    status: {
      type: String,
      enum: ["not_added", "added", "verified"],
      default: "not_added",
    },
  },
  { timestamps: true },
);

const PartnerBank =
  mongoose.models.PartnerBank ||
  mongoose.model<IPartnerBank>("PartnerBank", partnerBankSchema);
export default PartnerBank;
