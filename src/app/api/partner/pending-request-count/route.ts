import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    // 1. Authentication Check
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "User is unauthenticated" },
        { status: 401 },
      );
    }
    if (session.user.role !== "partner") {
      return NextResponse.json(
        {
          message: "Partner is unauthorized",
        },
        { status: 403 },
      );
    }

    await connectDB();

    const partner = await User.findOne({ email: session.user.email });
    if (!partner) {
      return NextResponse.json(
        {
          message: "Partner is not found",
        },
        { status: 404 },
      );
    }

    const count = await Booking.countDocuments({
      driver: partner._id,
      bookingStatus: "requested",
    });

    return NextResponse.json(count, { status: 200 });
  } catch (error) {
    console.error("Count fetching error  Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Internal Server Error" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message:
          "An unknown error occurred while fetching pending request count",
      },
      { status: 500 },
    );
  }
}
