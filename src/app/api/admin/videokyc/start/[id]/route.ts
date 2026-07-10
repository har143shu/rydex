import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import {NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    console.log(id);

    await connectDB();
    //mereko partner id chahiye toh path dynamic bnani jh
    const partner = await User.findById(id);

    if (!partner) {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 404 },
      );
    }

    const videoKycRoomId = `kyc-${id}-${Date.now()}`;

    partner.videoKycRoomId = videoKycRoomId;
    partner.videoKycStatus = "in_progress";

    await partner.save();

    return NextResponse.json(
      { message: "suceesfully started videoKYC" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error occurred while creating video KYC Room", error);
    return NextResponse.json(
      {
        message:
          "Internal server error occurred while creating video KYC Room",
      },
      { status: 500 },
    );
  }
}
