import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, vehicleType } = await req.json();
    if (!latitude || !longitude) {
      return NextResponse.json(
        {
          message: "user Current location not accessible",
        },
        {
          status: 400,
        },
      );
    }
    console.log("Request:", latitude, longitude);
    await connectDB();

    // wo partner find karo jo online ho =? 10 km ke area me ho
    const partners = await User.find({
      role: "partner",
      partnerStatus: "approved",
      isOnline: true,
      location: {
        $near: {
          //user ki location
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 10000,
        },
      },
    });


    const partnerIds = partners.map((p) => p._id);

    if(partnerIds.length === 0){
         return NextResponse.json(
        [],
        {
          status: 400,
        },
      );
    }

    const vehicle = await Vehicle.find({
      owner: { $in: partnerIds },
      type: vehicleType,
      status: "approved",
      isActive: true,
    });

    if (!vehicle) {
      return NextResponse.json(
        {
          message: "There ate no partners near you",
        },
        {
          status: 200,
        },
      );
    }

    return NextResponse.json(vehicle, {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: `error in getting partners near you: ${error}`,
      },
      {
        status: 500,
      },
    );
  }
}
