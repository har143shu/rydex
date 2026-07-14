import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();


    // 1. Authentication & Role Guard
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "User is Unauthenticated" },
        { status: 401 },
      );
    }

    if (!session?.user?.role || session.user.role !== "partner") {
      return NextResponse.json(
        { message: "User is Unauthorized. Partner access required." },
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const image = formData.get("image") as Blob | null;
    const basePriceStr = formData.get("basePrice");
    const waitingChargeStr = formData.get("waitingCharge");
    const pricePerKmStr = formData.get("pricePerKm");

    // 2. Presence Guard Condition
    // NOTE: Humne yahan se 'image' hata diya hai taaki edit ke time block na kare
    if (!basePriceStr || !waitingChargeStr || !pricePerKmStr) {
      return NextResponse.json(
        {
          message:
            "All pricing fields (basePrice, waitingCharge, pricePerKm) are required",
        },
        { status: 400 },
      );
    }

    // 3. Number Validation Guard
    const basePrice = Number(basePriceStr);
    const waitingCharge = Number(waitingChargeStr);
    const pricePerKm = Number(pricePerKmStr);

    if (
      isNaN(basePrice) ||
      isNaN(waitingCharge) ||
      isNaN(pricePerKm) ||
      basePrice < 0 ||
      waitingCharge < 0 ||
      pricePerKm < 0
    ) {
      return NextResponse.json(
        { message: "Pricing fields must be valid non-negative numbers" },
        { status: 400 },
      );
    }

    // Database Connection
    await connectDB();

    const partner = await User.findOne({ email: session.user.email });
    if (!partner) {
      return NextResponse.json(
        { message: "Partner not found in records" },
        { status: 404 },
      );
    }

    // 4. Vehicle Find OR Upsert Logic
    const partnerVehicle = await Vehicle.findOne({ owner: partner._id });
    if (!partnerVehicle) {
        return NextResponse.json(
        { message: "partner vehicle not found" },
        { status: 400 },
      );
    }

    // 5. 🔥 CONDITIONAL IMAGE GUARD (Pehli Baar Mandatory, Next Time Optional)
    // Case A: User ne nayi image upload ki hai
    if (image && typeof image === "object" && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Uploaded file must be a valid image" },
          { status: 400 },
        );
      }
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: "Image size must be less than 5MB" },
          { status: 400 },
        );
      }

      // Cloudinary pe nayi image upload karo
      const imageUrl = await uploadOnCloudinary(image);
      if (!imageUrl) {
        return NextResponse.json(
          { message: "Failed to upload image to cloud storage" },
          { status: 500 },
        );
      }
      // Naye URL ko vehicle object me update karo
      partnerVehicle.imageUrl = imageUrl;
    }
    // Case B: Nayi image nahi aayi, par purani image bhi DB me nahi hai (FIRST TIME ONBOARDING)
    else if (!partnerVehicle.imageUrl) {
      return NextResponse.json(
        { message: "Vehicle image is compulsory for the first time!" },
        { status: 400 },
      );
    }
    // Case C: Nayi image nahi aayi, par DB me purani hai (EDITING) -> Hum kuch nahi karenge, purana URL safe rahega!

    // 6. Values update karo
    partnerVehicle.basePrice = basePrice;
    partnerVehicle.pricePerKM = pricePerKm;
    partnerVehicle.waitingCharge = waitingCharge;
    partnerVehicle.status = "pending";

    partner.partnerOnBoardingSteps = 6;

    // Save both documents concurrently
    await Promise.all([partnerVehicle.save(), partner.save()]);

    return NextResponse.json(
      {
        message: "Pricing and vehicle details saved successfully",
        imageUrl: partnerVehicle.imageUrl,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Set pricing error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}


export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    // Session aur email dono check karna better hai
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "User is Unauthenticated" },
        { status: 401 },
      );
    }

    if (!session?.user?.role || session.user.role !== "partner") {
      return NextResponse.json(
        { message: "User is Unauthorized. Partner access required." },
        { status: 403 },
      );
    }

    const partner = await User.findOne({ email: session.user.email });
    if (!partner) {
      return NextResponse.json({ message: "partner not found" }, { status: 404 });
    }

    const vehicle = await Vehicle.findOne({ owner: partner._id });
    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicles not found in Documents" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      vehicle,
      { status: 200 },
    );
  } catch (error) {
    console.error("Get pricing details Error:", error);
    return NextResponse.json(
      { message: "Internal server error while fetching pricing details" },
      { status: 500 },
    );
  }
}
