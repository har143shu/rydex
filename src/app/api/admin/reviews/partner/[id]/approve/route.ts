import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import PartnerBank from "@/models/PartnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    // 1. Authentication Check (401)
    if (!session || !session?.user?.email) {
      return NextResponse.json(
        { message: "User is unauthenticated" },
        { status: 401 },
      );
    }

    // 2. Authorization Check (403)
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Access forbidden: Admin rights required" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // 3. Validate MongoDB ObjectId Format (400)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid Partner ID format" },
        { status: 400 },
      );
    }

    await connectDB();

    // Note: We need full Mongoose documents here (no .lean()) because we are calling .save()
    const partner = await User.findById(id).select("-password -__v");

    if (!partner || partner.role !== "partner") {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 404 },
      );
    }

    if (partner.partnerStatus === "approved") {
      return NextResponse.json(
        { message: "Partner is already approved" },
        { status: 400 },
      );
    }

    // Fetch related docs in parallel
    const [documents, bank] = await Promise.all([
      PartnerDocs.findOne({ owner: id }),
      PartnerBank.findOne({ owner: id }),
    ]);

    if (!documents || !bank) {
      return NextResponse.json(
        { message: "Partner did not complete onboarding steps" },
        { status: 400 },
      );
    }

    // Update statuses in memory
    partner.partnerStatus = "approved";
    partner.partnerOnBoardingSteps = 4;
    partner.videoKycStatus="pending";
    documents.status = "approved";
    bank.status = "verified";

    // CHANGE 2: Save all documents in parallel for maximum performance
    await Promise.all([
      partner.save(),
      documents.save(),
      bank.save(),
    ]);

    // CHANGE 3: Fixed syntax error (added missing comma)
    return NextResponse.json(
      {
        success: true,
        message: "Partner approved successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error occurred while approving partner:", error);
    return NextResponse.json(
      {
        message: "Internal server error while approving partner",
      },
      { status: 500 },
    );
  }
}