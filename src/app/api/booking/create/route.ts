import { auth } from "@/auth";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose"; // ID validation ke liye

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // 1. AUTH GUARD: Authentication Check
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "User is unauthenticated" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      driverId,
      vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      mobileNumber,
    } = body;

    // 2. INPUT GUARD: Strict & Safe Validation (No Crash on Undefined)
    const isValidCoordinates = (loc: any) =>
      loc && Array.isArray(loc.coordinates) && loc.coordinates.length === 2;

    if (
      !driverId ||
      !vehicleId ||
      !fare ||
      !mobileNumber ||
      !isValidCoordinates(pickUpLocation) ||
      !isValidCoordinates(dropLocation)
    ) {
      return NextResponse.json(
        {
          message:
            "Missing or invalid required details (IDs, coordinates, fare)",
        },
        { status: 400 },
      );
    }

    // 3. OBJECT-ID GUARD: Prevent Mongoose CastErrors
    if (
      !mongoose.Types.ObjectId.isValid(driverId) ||
      !mongoose.Types.ObjectId.isValid(vehicleId)
    ) {
      return NextResponse.json(
        { message: "Invalid driverId or vehicleId format" },
        { status: 400 },
      );
    }

    // 4. GET USER FIRST (Taaki existing booking jaldi check ho sake)
    const user = await User.findOne({ email: session.user.email }).select(
      "_id",
    );
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 5. EXISTING BOOKING GUARD: Fail-Fast (Don't query driver if booking exists)
    const existingBooking = await Booking.findOne({
      user: user._id,
      bookingStatus: {
        $in: ["requested", "awaiting_payment", "confirmed", "started"],
      },
    });

    if (existingBooking) {
      // 200 OK ke sath return karo taaki frontend handle kar le
      return NextResponse.json(existingBooking, { status: 200 });
    }

    // 6. FETCH DRIVER & CREATE BOOKING
    const driver = await User.findById(driverId).select("_id mobileNumber");
    if (!driver) {
      return NextResponse.json(
        { message: "Driver not found" },
        { status: 404 },
      );
    }

    // 7. CREATE NEW BOOKING
    const booking = await Booking.create({
      user: user._id,
      driver: driver._id, // Strictly passing ID instead of full doc
      vehicle: vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      userMobileNumber: mobileNumber,
      driverMobileNumber: driver.mobileNumber,
      bookingStatus: "requested",
    });

    return NextResponse.json(booking, { status: 201 }); // 201 Created is better practice for POST
  } catch (error) {
    // Strict error handling taaki server hang na ho
    console.error("Booking Creation Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Internal Server Error" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "An unknown error occurred while creating booking" },
      { status: 500 },
    );
  }
}
