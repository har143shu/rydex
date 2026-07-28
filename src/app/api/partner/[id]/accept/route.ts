import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextResponse, NextRequest } from "next/server";

export async function PATCH(req: NextRequest,{params}:{params:Promise<{id:string}>}) {
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

    const {id} = await params;
    console.log(id);

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

    const booking = await Booking.findById(id);

    if(!booking){
        return NextResponse.json(
        {
          message: "Booking is not found",
        },
        { status: 404 },
      );
    }

    booking.bookingStatus = "awaiting_payment";
    booking.paymentDeadline= new Date(Date.now() + 5*60*1000);

    await booking.save();


    return NextResponse.json({
        message:"ride accepted successfully"
    },{
        status:200
    });

  } catch (error) {
    console.error("ride accepting  error  Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Internal Server Error" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message:
          "An unknown error occurred while accepting ride by partner",
      },
      { status: 500 },
    );
  }
}
