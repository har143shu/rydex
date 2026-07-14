import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import PartnerBank from "@/models/PartnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
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
        { message: "Invalid Vehicle ID format" },
        { status: 400 },
      );
    }

    await connectDB();


    const vehicle = await Vehicle.findById(id);



    if (!vehicle) {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 404 },
      );
    }

    if (vehicle.status === "approved") {
      return NextResponse.json(
        { message: "Vehicle is already approved" },
        { status: 400 },
      );
    }

    const partner = await User.findById(vehicle.owner);

     if (!partner || partner.role !== "partner") {
       return NextResponse.json(
         { message: "Partner not found" },
         { status: 404 },
       );
     }

    vehicle.status = "approved";
    vehicle.rejectionReason=undefined;
    partner.partnerOnBoardingSteps=7;

    await Promise.all([ partner.save(),vehicle.save()]);
    // CHANGE 3: Fixed syntax error (added missing comma)
    return NextResponse.json(
      {
        success: true,
        message: "Vehicle approved successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error occurred while approving Vehicle:", error);
    return NextResponse.json(
      {
        message: "Internal server error while approving Vehicle",
      },
      { status: 500 },
    );
  }
}