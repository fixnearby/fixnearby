import { UserModel } from "@/model/User";
import dbConnect from "../../../../lib/dbConnect";
import { ApiResponse } from "@/types/ApiResponse";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { email, password, name } = await request.json();
       
        // Check if user already exists
        const existingUser = await UserModel.findOne({
            username: name,
            isVerified: true
        });

        if(existingUser) {
            const response: ApiResponse = {
                success: false,
                status: 400,
                message: 'User already exists'
            };
            return Response.json(response, { status: 400 });
        }
        
        const existingUserByEmail = await UserModel.findOne({ email: email });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserByEmail) {
            if(existingUserByEmail.isVerified) {
                const response: ApiResponse = {
                    success: false,
                    status: 400,
                    message: 'User already exists'
                };
                return Response.json(response, { status: 400 });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1);

                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = expiryDate;
                existingUserByEmail.isVerified = false;
                existingUserByEmail.isAcceptingMessages = true;
                existingUserByEmail.messages = [];

                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username: name,
                password: hashedPassword,
                email: email,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            });

            await newUser.save();
        }

        // Send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            name,
            verifyCode
        );

        if(emailResponse.success) {
            const response: ApiResponse = {
                success: true,
                status: 201,
                message: 'User registered successfully. Please check your email to verify your account.'
            };
            return Response.json(response, { status: 201 });
        } else {
            const response: ApiResponse = {
                success: false,
                status: 500,
                message: 'Failed to send verification email. Please try again later.'
            };
            return Response.json(response, { status: 500 });
        }

    } catch (error) {
        console.error('Error registering user', error);

        const response: ApiResponse = {
            success: false,
            status: 500,
            message: 'Internal server error'
        };
        return Response.json(response, { status: 500 });
    }
}
