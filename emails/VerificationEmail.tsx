import * as React from "react";

export default function VerificationEmail({
  userName,
  verifycode,
}: {
  userName: string;
  verifycode: string;
}) {
  return (
    <div>
      <h2>Hello, {userName}!</h2>
      <p>Your OTP for registration is: <strong>{verifycode}</strong></p>
      <p>This code will expire in 1 hour.</p>
    </div>
  );
}