import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "User is Unauthenticated" },
        { status: 403 },
      );
    }

    const dbUser = await User.findOne({ email: session.user.email });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { type, number, vehicleModel } = await req.json();
    if (!type || !number || !vehicleModel) {
      return NextResponse.json(
        { message: "Missing required details" },
        { status: 400 },
      );
    }
    const vehicleNumber = number.toUpperCase();

    // FIX 2: Correct error message and status code
    if (!VEHICLE_REGEX.test(vehicleNumber)) {
      return NextResponse.json(
        { message: "Invalid Vehicle Number Format" },
        { status: 400 },
      );
    }

    // Use vehicleNumber for all DB queries now
    const duplicateVehicle = await Vehicle.findOne({ number: vehicleNumber });
    let vehicle = await Vehicle.findOne({ owner: dbUser._id });

    if (vehicle) {
      if (
        duplicateVehicle &&
        duplicateVehicle._id.toString() !== vehicle._id.toString()
      ) {
        // FIX 3: Consistent NextResponse
        return NextResponse.json(
          { message: "Vehicle number already registered to another user" },
          { status: 409 },
        );
      }

      vehicle.type = type;
      vehicle.number = vehicleNumber;
      vehicle.vehicleModel = vehicleModel;
      vehicle.status = "pending";
      dbUser.partnerStatus="pending";

      if(dbUser.partnerOnBoardingSteps >= 3){
        dbUser.partnerOnBoardingSteps = 3
      }
      await Promise.all(
         [vehicle.save(),dbUser.save()]
      )
      return NextResponse.json(
        {
          message: "vehilce details updated successfully",
          data: vehicle,
        },
        { status: 201 },
      );
    }

    if (duplicateVehicle) {
      return NextResponse.json(
        { message: "Vehicle already registered" },
        { status: 409 },
      );
    }

    vehicle = await Vehicle.create({
      owner: dbUser._id,
      type,
      number: vehicleNumber,
      vehicleModel,
    });

    if (dbUser.partnerOnBoardingSteps < 1) {
      dbUser.partnerOnBoardingSteps = 1;
    }

    dbUser.role = "partner";
    // dbUser.partnerStatus = "pending";
    await dbUser.save();

    return NextResponse.json(
      {
        message: "vehilce details updated successfully",
        data: vehicle,
      },
      { status: 201 },
    );
    
  } catch (error) {
    console.error("Vehicle Registration Error:", error);
    return NextResponse.json(
      { message: "Internal server error during vehicle registration" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    // 401 is standard for missing authentication
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const vehicle = await Vehicle.findOne({ owner: user._id });

    if (vehicle) {
      return NextResponse.json(
        { message: "vehicle details fetched", data: vehicle },
        { status: 200 },
      );
    } else {
      // 404 is standard when a resource doesn't exist in the database
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 },
      );
    }
  } catch (error) {
    // Log the actual error on the server side for debugging
    console.error("Get Vehicle Error:", error);

    // Send a clean message to the client
    return NextResponse.json(
      { message: "Internal server error while fetching vehicle" },
      { status: 500 },
    );
  }
}
