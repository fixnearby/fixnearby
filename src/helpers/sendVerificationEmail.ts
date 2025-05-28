import { resend } from "../../lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";

export async function sendVerificationEmail(
  userEmail: string,
  userName: string,
  verifyCode: string
) {
  try {
    await resend.emails.send({
      from: 'onboardin@resend.dev', // Must be a verified sender in Resend
      to: userEmail,
      subject: 'Verify your email',
      react: VerificationEmail({ userName, verifycode: verifyCode })
    });
    return { success: true };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return { success: false, message: "Failed to send verification email." };
  }
}