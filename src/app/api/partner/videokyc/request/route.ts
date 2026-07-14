import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import {NextResponse } from "next/server";

export async function PATCH() {
  try {
    const session = await auth();
    console.log("SESSION:", session);
    console.log("ROLE:", session?.user?.role);

    // 1. Authentication Check
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "User is unauthenticated" },
        { status: 401 },
      );
    }

    // 2. Authorization Check (Fixed)
    // KYC re-apply karne ke liye user ka role 'partner' hona chahiye, 'admin' nahi.
    if (session.user.role !== "partner") {
      return NextResponse.json(
        {
          message: "Access forbidden: Only partners can re-apply for Video KYC",
        },
        { status: 403 },
      );
    }

    await connectDB();

    // 3. Database Update Check
    // Ek user sirf tabhi re-apply kar sakta hai jab uska purana KYC "rejected" ho.
    // Hum findOneAndUpdate use karenge taaki 1 hi query mein kaam ho jaye.
    const partner = await User.findOneAndUpdate(
      {
        email: session.user.email,
        videoKycStatus: "rejected", // Ensures user can't reapply if already approved or pending
      },
      {
        $set: { videoKycStatus: "pending" },
        // $unset database se in fields ko completely remove kar dega bajaye empty string save karne ke
        $unset: { videoKycRejectionReason: "", videoKycRoomId: "" },
      },
      { new: true }, // Returns updated document
    );

    if (!partner) {
      return NextResponse.json(
        {
          message:
            "Partner not found, or you are not eligible to re-apply (KYC is not rejected)",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Successfully re-applied for Video KYC" },
      { status: 200 },
    );
  } catch (error) {
    // Fixed typo in error message
    console.error(
      "[KYC_REAPPLY_ERROR]: Error occurred while making request for video KYC",
      error,
    );
    return NextResponse.json(
      {
        message:
          "Internal server error occurred while making request for video KYC",
      },
      { status: 500 },
    );
  }
}
