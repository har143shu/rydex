import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import PartnerBank from "@/models/PartnerBank.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Session aur email dono check karna better hai
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "User is Unauthenticated" },
        { status: 401 },
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { accountHolder, accountNumber, ifsc, upi, mobileNumber } =
      await req.json();

    // Guard 1: Check missing fields
    if (!accountHolder || !accountNumber || !ifsc || !mobileNumber) {
      return NextResponse.json(
        { message: "Missing required bank details" },
        { status: 400 },
      );
    }

    const formattedAccountHolder = accountHolder.trim();
    const formattedAccountNumber = accountNumber.trim();
    const formattedIfsc = ifsc.trim().toUpperCase();
    const formattedUpi = upi?.trim();
    const formattedMobile = mobileNumber.trim();

    // Guard 2: Format Validations (Basic Regex)
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile number validation
    if (!mobileRegex.test(formattedMobile)) {
      return NextResponse.json(
        { message: "Invalid Mobile Number" },
        { status: 400 },
      );
    }

    const accountHolderRegex = /^[A-Za-z\s.'-]{3,50}$/;

    if (!accountHolderRegex.test(formattedAccountHolder)) {
      return NextResponse.json(
        { message: "Invalid Account Holder Name" },
        { status: 400 },
      );
    }

    const accountNumberRegex = /^\d{9,18}$/;

    if (!accountNumberRegex.test(formattedAccountNumber)) {
      return NextResponse.json(
        { message: "Invalid Account Number" },
        { status: 400 },
      );
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/; // Proper IFSC format
    if (!ifscRegex.test(formattedIfsc)) {
      return NextResponse.json(
        { message: "Invalid IFSC Code" },
        { status: 400 },
      );
    }

    if (formattedUpi) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

      if (!upiRegex.test(formattedUpi)) {
        return NextResponse.json(
          { message: "Invalid UPI ID" },
          { status: 400 },
        );
      }
    }

    // Guard 3: Prevent editing if already verified
    const existingBank = await PartnerBank.findOne({ owner: user._id });
    if (existingBank && existingBank.status === "verified") {
      return NextResponse.json(
        {
          message:
            "Bank details are already verified. You cannot change them now.",
        },
        { status: 403 },
      );
    }

    // Guard 4: Check if Account Number is already used by ANOTHER user
    const duplicateAccount = await PartnerBank.findOne({
      accountNumber: formattedAccountNumber,
      owner: { $ne: user._id },
    });

    if (duplicateAccount) {
      return NextResponse.json(
        {
          message:
            "This account number is already registered with another user.",
        },
        { status: 409 }, // 409 Conflict
      );
    }

    // Update or Insert Partner Bank
    const partnerBank = await PartnerBank.findOneAndUpdate(
      { owner: user._id },
      {
        $set: {
          accountHolder: formattedAccountHolder,
          accountNumber: formattedAccountNumber,
          ifsc: formattedIfsc,
          upi: formattedUpi,
          status: "added",
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    // Update User
    user.mobileNumber = formattedMobile;
    user.partnerOnBoardingSteps = 3;
    user.partnerStatus = "pending";

    await user.save();

    // Success response formatted
    return NextResponse.json(
      { message: "Bank details updated successfully", data: partnerBank },
      { status: 201 },
    );
  } catch (error: any) {
    // Critical: Never leave catch block empty
    console.error("Bank details update error:", error);

    // Check for mongoose duplicate key error just in case (E11000)
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Duplicate entry detected." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "User is Unauthenticated" },
        { status: 401 },
      );
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const partnerBank = await PartnerBank.findOne({ owner: user._id });

    return NextResponse.json(
      {
        success: true,
        data: partnerBank, // null hoga agar pehli baar hai
        mobileNumber: user.mobileNumber,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}