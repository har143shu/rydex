import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
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

    const { id } = await params; // id of vehicle

    // 3. Validate MongoDB ObjectId Format (400)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid vehicle ID format" },
        { status: 400 },
      );
    }

    await connectDB();

    const vehicle = await Vehicle.findById(id).populate("owner").lean();
    
    const partner = await User.findById(vehicle.owner).select("-password -__v").lean();

    if (!partner || partner.role !== "partner") {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 404 },
      );
    }


    return NextResponse.json(
      vehicle ?? {},
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get Vehicle Review Detail Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error while fetching Vehicle review detail",
      },
      { status: 500 },
    );
  }
}
