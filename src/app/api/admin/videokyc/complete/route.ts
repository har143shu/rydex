import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
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

    const { roomId, action, rejectionReason } = await req.json();

    if (!roomId) {
      return NextResponse.json(
        { message: "Not a Valid Video KYC session" },
        { status: 400 },
      );
    }

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { message: "Not a Valid Action" },
        { status: 400 },
      );
    }

    await connectDB();

    const partner = await User.findOne({
      role: "partner",
      videoKycRoomId: roomId,
    });

       if (!partner) {
     return NextResponse.json(
       { message: "Partner not found for this Video KYC session" },
       { status: 404 },
     );
   }

    if (action === "approved") {
      partner.videoKycStatus = "approved";
      partner.partnerOnBoardingSteps = 5;
    } else if (action === "rejected") {
      const reason = rejectionReason.trim();
      if (!reason) {
        return NextResponse.json(
          { message: "Please provide a Rejection Reason" },
          { status: 400 },
        );
      }
      partner.videoKycStatus = "rejected";
      partner.videoKycRejectionReason = reason;
    }

    await partner.save();



   return NextResponse.json(
     { message: `Admin successfully ${action} Video KYC` },
     { status: 200 },
   );
  } catch (error) {
    console.error("[VIDEO_KYC_PATCH_ERROR]:", error);
    return NextResponse.json(
      { message: "Internal server error while processing Video KYC action" },
      { status: 500 }
    );
  }
}
