import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Session aur email dono check karna better hai
    if (!session || !session?.user?.email || session?.user?.role !== "admin") {
      return NextResponse.json(
        { message: "User is Unauthenticated" },
        { status: 401 },
      );
    }

    await connectDB();

    const totalPartners = await User.countDocuments({ role: "partner" });
    const totalApprovedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "approved",
    });
    const totalRejectedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "rejected",
    });
    const totalPendingPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "pending",
    });

    //mereko review wale users bhi bhejne h id name email or unke vehicle type ke sath
    const totalPendingPartnerForReview = await User.find({
      role: "partner",
      partnerStatus: "pending",
      partnerOnBoardingSteps: 3,
    });

    const partnerId = totalPendingPartnerForReview.map((p) => p._id);

    const partnerVehicle = await Vehicle.find({
      owner: { $in: partnerId },
    });

    //me ek map store kar leta hu jisse mereko id ke corrosponding map mil jae

    const partnerIdToTypeMap = new Map(
      partnerVehicle.map((v) => [String(v.owner), v.type]),
    );

    const partnerForReview = totalPendingPartnerForReview.map((p) => {
      return {
        _id: p._id,
        name: p.name,
        email: p.email,
        type: partnerIdToTypeMap.get(String(p._id)),
      };
    });

    return NextResponse.json(
      {
        partnerForReview,
        stats: {
          totalPartners,
          totalApprovedPartners,
          totalRejectedPartners,
          totalPendingPartners,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get Admin Dashboard Detail Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error while fetching Admin Dashboard Detail",
      },
      { status: 500 },
    );
  }
}
