import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

import dbConnect from "../../../../../lib/dbConnect";
import { UserModel } from "@/model/User";

// Custom AuthUser type for session/jwt
interface AuthUser {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        await dbConnect();

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          }) as (AuthUser & { _id: Types.ObjectId; password: string }) | null;

          if (!user) {
            throw new Error("No user found with the given credentials");
          }

          if (!user.isVerified) {
            throw new Error("User is not verified");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
            isAcceptingMessages: user.isAcceptingMessages,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
       
        token.username = user.username;
        token.isVerified = (user as AuthUser).isVerified;
        token.isAcceptingMessages = (user as AuthUser).isAcceptingMessages;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email ?? "", // Prevent null assignment
          username: token.username as string,
          isVerified: token.isVerified as boolean,
          isAcceptingMessages: token.isAcceptingMessages as boolean,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;