'use client'

import { signIn,signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function SignInPage() {
 const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div>
        <h1>Welcome back, {session.user?.name || session.user?.email}!</h1>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => signIn("credentials")}>Sign In with Credentials</button>
    </div>
  );
}