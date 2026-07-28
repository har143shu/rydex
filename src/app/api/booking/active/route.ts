import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();

    // 1. AUTH GUARD: Authentication Check
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "User is unauthenticated" },
        { status: 401 },
      );
    }

    // 2. USER GUARD: Null check taaki user._id crash na kare
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found in database" },
        { status: 404 },
      );
    }

    // 3. BOOKING FETCH
    const booking = await Booking.findOne({
      user: user._id,
      bookingStatus: {
        $in: ["requested", "awaiting_payment", "confirmed", "started"],
      },
    });

    // Agar active booking nahi mili, toh ID null bhej do
    if (!booking) {
      return NextResponse.json(
        { booking: "idle", bookingId: null },
        { status: 200 },
      );
    }

    // Active booking mil gayi toh status aur _id dono return karo
    return NextResponse.json(
      {
        booking: booking.bookingStatus,
        bookingId: booking._id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Booking Fetch Error:", error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
        booking: "idle",
        bookingId: null, // Fallback me bhi null taaki UI crash na ho
      },
      { status: 500 },
    );
  }
}
