import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { generateOTP, sendOTPEmail } from "../libs/emailService";
import AdminOTP from "../models/AdminOTP";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, otp, step } = body;

    // STEP 1: Initial login with credentials
    if (step === 1) {
      if (!email || !password) {
        return NextResponse.json({
          success: false,
          error: "Email and password are required",
        });
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = "$2b$10$qdK3pem8bhAWyj0Q45UxfuWcxir7HORQDwFiFiSBSe7jkgdTReBJO";

      // Verify email
      if (email !== adminEmail) {
        return NextResponse.json({ success: false, error: "Email is wrong" });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, adminPassword);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: "Password is wrong" });
      }

      // Set cookie for authentication
      const res = NextResponse.json({
        success: true,
        message: "Login successful",
        step: 3,
      });

      res.cookies.set("admin", "true", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
      });

      return res;
    }

    // STEP 2: Verify OTP
    if (step === 2) {
      if (!email || !otp) {
        return NextResponse.json({
          success: false,
          error: "Email and OTP are required",
        });
      }

      // Connect to MongoDB
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
      }

      // Find OTP record
      const otpRecord = await AdminOTP.findOne({ email });

      if (!otpRecord) {
        return NextResponse.json({
          success: false,
          error: "OTP expired or invalid. Please login again.",
        });
      }

      // Check attempts
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        await AdminOTP.deleteOne({ email });
        return NextResponse.json({
          success: false,
          error: "Maximum OTP attempts exceeded. Please login again.",
        });
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();

        const attemptsLeft = otpRecord.maxAttempts - otpRecord.attempts;
        return NextResponse.json({
          success: false,
          error: `Invalid OTP. ${attemptsLeft} attempts remaining.`,
        });
      }

      // OTP verified
      otpRecord.isVerified = true;
      await otpRecord.save();

      // Set cookie for authentication
      const res = NextResponse.json({
        success: true,
        message: "Login successful",
        step: 3,
      });

      res.cookies.set("admin", "true", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
      });

      return res;
    }

    return NextResponse.json({
      success: false,
      error: "Invalid request",
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json({
      success: false,
      error: "Server error. Please try again.",
    });
  }
}