import { UserModel } from "@/model/User";
import dbConnect from "../../../../lib/dbConnect";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { name, username, phone, email, password, address, pincode } = await request.json();

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