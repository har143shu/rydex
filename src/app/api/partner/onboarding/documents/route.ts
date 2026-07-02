import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "User is Unauthenticated" },
        { status: 401 }, // 401 is more accurate for missing auth
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const aadhar = formData.get("aadhar") as Blob | null;
    const license = formData.get("license") as Blob | null;
    const rc = formData.get("rc") as Blob | null;

    if (!aadhar || !license || !rc) {
      return NextResponse.json(
        { message: "Missing required documents" },
        { status: 400 },
      );
    }

    const [aadharUrl, licenseUrl, rcUrl] = await Promise.all([
      uploadOnCloudinary(aadhar),
      uploadOnCloudinary(license),
      uploadOnCloudinary(rc),
    ]);

    // Agar koi ek bhi upload fail ho gaya toh early return
    if (!aadharUrl || !licenseUrl || !rcUrl) {
      return NextResponse.json(
        { message: "Failed to upload one or more documents to Cloudinary" },
        { status: 500 },
      );
    }

    const uploadDocs = {
      aadharUrl,
      licenseUrl,
      rcUrl,
      status: "pending",
    };

    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      { $set: uploadDocs },
      { upsert: true, new: true },
    );

    if (user.partnerOnBoardingSteps < 2) {
      user.partnerOnBoardingSteps = 2;
      await user.save();
    }

    return NextResponse.json(
      { message: "documents details updated successfully", data: partnerDocs },
      { status: 201 },
    );
  } catch (error) {
    console.error("Document Upload Error:", error);
    return NextResponse.json(
      { message: "Internal server error during document upload" },
      { status: 500 },
    );
  }
}