import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/seller/login") ||
        pathname.startsWith("/seller/register") ||
        pathname.startsWith("/admin/login") ||
        pathname.startsWith("/owner/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/register") ||
        pathname.startsWith("/api/otp/login") ||
        pathname.startsWith("/api/webhooks");

      if (isPublic) return true;
      if (pathname === "/") return true;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
