import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
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

    const {rejectionReason} = await req.json();

    await connectDB();

    // Note: We need full Mongoose documents here (no .lean()) because we are calling .save()
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 },
      );
    }

    // Update statuses in memory
    vehicle.status = "rejected";
    vehicle.rejectionReason = rejectionReason;
    
    await vehicle.save();

    return NextResponse.json(
      {
        success: true,
        message: "vehicle rejected successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error occurred while rejecting vehicle:", error);
    return NextResponse.json(
      {
        message: "Internal server error while rejecting vehicle",
      },
      { status: 500 },
    );
  }
}