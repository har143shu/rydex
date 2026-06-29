import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      if (!email || !otp) {
        return NextResponse.json(
          { message: "Email and OTP are required" },
          { status: 400 },
        );
      }
    }

    // 2. DB Connection
    await connectDB();

    // 3. User Fetch (let ki jagah const use karein kyunki re-assign nahi karna hai)
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }, // 404 Not Found is more accurate here
      );
    }
    // 4. Validation Checks
    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 },
      );
    }

    // OTP match check pehle karna better hai, uske baad expiry check
    if (user.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }
    // 5. Update and Save
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    // 6. Success Response
    return NextResponse.json(
      { message: "Email is verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error during verification",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
