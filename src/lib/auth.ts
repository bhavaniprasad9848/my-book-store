import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { verifyOtp } from "@/lib/otp";
import { parsePortal, portalError } from "@/lib/portal";

/** Lets the login page tell "wrong code" apart from "wrong password". */
class InvalidOtpError extends CredentialsSignin {
  code = "invalid_otp";
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  otp: z.string(),
  portal: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "Code", type: "text" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        // Each role signs in on its own page: /login, /seller/login or /admin/login.
        const wrongPage = portalError(parsePortal(parsed.data.portal), user.role);
        if (wrongPage) {
          const err = new InvalidOtpError();
          err.code = wrongPage;
          throw err;
        }

        // Second step: the 6-digit code emailed by /api/otp/login.
        const check = await verifyOtp(email, "LOGIN", parsed.data.otp);
        if (!check.ok) {
          const err = new InvalidOtpError();
          err.code = check.error;
          throw err;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
