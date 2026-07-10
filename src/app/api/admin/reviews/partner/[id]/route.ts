import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import PartnerBank from "@/models/PartnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    // 4. Use .lean() and exclude sensitive fields if necessary
    const partner = await User.findById(id).select("-password -__v").lean();

    if (!partner || partner.role !== "partner") {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 404 },
      );
    }

    // 5. Fetch related data in parallel using Promise.all & .lean()
    const [vehicle, documents, bank] = await Promise.all([
      Vehicle.findOne({ owner: id }).lean(),
      PartnerDocs.findOne({ owner: id }).lean(),
      PartnerBank.findOne({ owner: id }).lean(),
    ]);

    return NextResponse.json(
      {
        partner,
        vehicle: vehicle ?? null,
        documents: documents ?? null,
        bank: bank ?? null,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get Partner Review Detail Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error while fetching partner review detail",
      },
      { status: 500 },
    );
  }
}
