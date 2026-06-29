import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Check Authentication
    const session = await auth();
    if (!session || !session?.user?.email) {
      return NextResponse.json(
        { message: "User is not authenticated" },
        { status: 401 }, // 401: Unauthorized (400 nahi)
      );
    }

    // 2. Connect Database
    await connectDB();

    // 3. Find User (Pro-tip: select('-password') use karo agar DB me password hai)
    const user = await User.findOne({ email: session.user.email }).select(
      "-password",
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }, // 404: Not Found (400 nahi)
      );
    }

    // 4. Success Response (User mil gaya)
    return NextResponse.json(
      { success: true, user }, // Data ko proper object me wrap karna better practice hai
      { status: 200 }, // 200: OK (Success code)
    );
  } catch (error) {
    // console.error("findME error occurred:", error); // console.error use karna better hai
    return NextResponse.json(
      {
        success: false,
        message: `Internal server error - ${error}`,
      },
      { status: 500 }, // 500: Internal Server Error (Catch block ke liye)
    );
  }
}
