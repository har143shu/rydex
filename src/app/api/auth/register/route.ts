import { connectDB } from "@/lib/db";
import { sendMail } from "@/lib/sendMails";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "All fields are required",
        },
        {
          status: 400,
        },
      );
    }

    // Connect Database
    await connectDB();

    // Check existing user
    let existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isUserVerified) {
      return NextResponse.json(
        {
          message: "User with this email already exists",
        },
        {
          status: 400,
        },
      );
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser && !existingUser.isUserVerified) {
      // Normal property assignment (cleaner syntax)
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiresAt = otpExpiresAt;
      await existingUser.save();
    } else {
      // Create User
      existingUser = await User.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt,
      });
    }

    await sendMail(
      email,
      "🔐 Verify Your Email - Rydex",
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <title>Email Verification</title>
        </head>
        <body style="margin:0;padding:0;background:#09090b;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:50px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.8);">

                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding:40px 30px 30px;border-bottom:1px solid #27272a;">
                      <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:2px;font-weight:700;text-transform:uppercase;">
                        <span style="color:#d4af37;">R</span>ydex
                      </h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0;color:#ffffff;font-size:22px;font-weight:500;">
                        Verify Your Email
                      </h2>

                      <p style="margin-top:25px;color:#a1a1aa;font-size:16px;line-height:1.7;">
                        Hi there,
                      </p>

                      <p style="color:#a1a1aa;font-size:16px;line-height:1.7;">
                        Welcome to <strong style="color:#ffffff;">Rydex</strong>. To complete your setup and ensure the security of your account, please use the verification code below.
                      </p>

                      <div style="margin:45px 0;text-align:center;">
                        <span style="
                          display:inline-block;
                          padding:20px 45px;
                          font-size:36px;
                          font-weight:bold;
                          letter-spacing:12px;
                          color:#d4af37;
                          background:#000000;
                          border:1px solid #d4af37;
                          border-radius:8px;
                          box-shadow:0 0 20px rgba(212,175,55,0.05);
                        ">
                          ${otp}
                        </span>
                      </div>

                      <p style="color:#a1a1aa;font-size:16px;line-height:1.7;">
                        This code expires in <strong style="color:#ffffff;">10 minutes</strong>.
                      </p>

                      <p style="color:#52525b;font-size:14px;line-height:1.6;margin-top:35px;">
                        If you didn't request this verification, please disregard this email. Your account remains secure.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="background:#09090b;padding:30px;color:#52525b;font-size:13px;border-top:1px solid #27272a;">
                      © ${new Date().getFullYear()} Rydex. All Rights Reserved.<br/>
                      <span style="display:inline-block;margin-top:8px;color:#3f3f46;">Premium Ride Experience</span>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
  `,
    );

    // Success Response
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Registration Error:", error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
