import { UserModel } from "@/model/User";
import dbConnect from "../../../../lib/dbConnect";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

import { signUpSchema } from "../../../schemas/signUpSchema"; // <-- Zod schema
import { z } from "zod";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();

    // ✅ Validate body using Zod
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path[0],
        message: err.message,
      }));

      return Response.json(
        {
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        },
        { status: 400 }
      );
    }

    const { name, username, phone, email, password, address, pincode } = body;

    // Check if user already exists (by email or phone)
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }]
    });
    if (existingUser) {
      return Response.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // Generate OTP and expiry
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (not verified yet)
    const newUser = new UserModel({
      name,
      username,
      phone,
      email,
      password: hashedPassword,
      address,
      pincode,
      verifyCode,
      verifyCodeExpiry,
      isVerified: false,
    });

    await newUser.save();

    // Send OTP to email
    await sendVerificationEmail(email, name, verifyCode);

    return Response.json(
      {
        success: true,
        message: "User registered. Please check your email for the OTP to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}