// types/next-auth.d.ts
//
// Augments the default NextAuth types so that session.user.id and
// session.user.role are available without TypeScript errors throughout the app.

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "ADMIN";
    };
  }

  interface User {
    id: string;
    role?: "ADMIN";
    googleRefreshToken?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN";
  }
}
