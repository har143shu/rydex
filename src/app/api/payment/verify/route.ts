import { connectDB } from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"

export async function POST(req:NextRequest) {
    try{
        await connectDB();
        const {booking_id,
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature} = await req.json();

          const hmac = crypto.createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET!,
          );//creating hashing machine

          hmac.update(razorpay_order_id + "|" + razorpay_payment_id);//,machine me string daali
          const generated_signature = hmac.digest("hex");

          if (generated_signature !== razorpay_signature) {
            return NextResponse.json({
              success: false,
              message: "invalid signature",
            });
          }
          const booking = await Booking.findById(booking_id);
          if (!booking) {
            return NextResponse.json({
              success: false,
              message: "booking is not found.",
            });
          }

           const adminCommission=(booking.fare*0.10);
            const partnerAmount=booking.fare-adminCommission
            booking.adminCommission=adminCommission
            booking.partnerAmount=partnerAmount
            booking.paymentStatus="paid"
            booking.bookingStatus = "confirmed"
            await booking.save()

            return NextResponse.json(
                    { success: true, adminCommission,partnerAmount },
                    { status: 200 }
            )


        
    }catch(error){
        return NextResponse.json(
            { 
                success: false,
                message: `verify payment error ${error}`
            },
          { status: 500 },
        );
    }
}