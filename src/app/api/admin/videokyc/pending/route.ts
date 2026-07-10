import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
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

    await connectDB();

    const partnerForKyc = await User.find({
      role: "partner",
      videoKycStatus: { $in: ["pending", "in_progress"] },
      partnerStatus: "approved",
      partnerOnBoardingSteps: 4,
    });

    return NextResponse.json(
      {
        partnerForKyc,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Error occurred while fetching partner regarding videoKyc:",
      error,
    );
    return NextResponse.json(
      {
        message:
          "Internal server error while fetching partner regarding videoKyc",
      },
      { status: 500 },
    );
  }
}
