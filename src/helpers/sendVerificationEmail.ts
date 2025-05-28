import {resend} from "../../lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";

import { ApiResponse } from "@/types/ApiResponse";


export async function sendVerificationEmail(
  userEmail: string,
  userName: string,
  verifyCode: string,
) : Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'onboardin@resend.dev',
            to: userEmail,  
            subject: 'Verify your email',
            react: await VerificationEmail({
                userName: userName,
                verifycode: verifyCode
            }) // Await in case VerificationEmail is async and returns a Promise<ReactNode>
        }); 

        return {
            success: true,
            message: 'Verification email sent successfully',
        };
        
    } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        return {
            success: false,
            message: "Failed to send verification email.",
        };
    }
} 
