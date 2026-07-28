import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(req: NextRequest,{params}:{params:Promise<{id:string}>}) {
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

    const {id} = await params;

    // 3. BOOKING FETCH
    const booking = await Booking.findById(id)
     
    if(!booking) {
      return NextResponse.json(
        {message:"booking not found to cancel"}, { status: 404 })
    }

    booking.bookingStatus="cancelled"
    await booking.save();

    return NextResponse.json(
      {message:"ride cancel successfully"},
      { status: 200 },
    );
  } catch (error) {
    console.error("Booking cancel Error:", error);

    return NextResponse.json(
      {
        message: `Internal Server Error: ${error}`,
      },
      { status: 500 },
    );
  }
}
