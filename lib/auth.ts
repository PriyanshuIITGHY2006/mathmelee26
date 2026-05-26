import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar",
          ].join(" "),
        },
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async signIn({ user }) {
  console.log("SIGNING IN:", user.email);
  console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
  console.log("MATCH:", user.email === process.env.ADMIN_EMAIL);
  return user.email === process.env.ADMIN_EMAIL;
},
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = "ADMIN";
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.refresh_token) {
        await prisma.user.update({
          where: { id: user.id },
          data: { googleRefreshToken: account.refresh_token },
        });
      }
    },
  },
};