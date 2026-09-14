import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { upsertGoogleUser } from "@/lib/google-user";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        try {
          const parsed = credentialsSchema.safeParse(raw);
          if (!parsed.success) return null;

          const email = parsed.data.email.toLowerCase().trim();
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || user.isDisabled || !user.passwordHash) return null;

          const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!ok) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
          };
        } catch (error) {
          console.error("Auth authorize failed", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const result = await upsertGoogleUser({
        email: user.email,
        name: user.name,
      });
      if ("error" in result) return false;

      user.id = result.user.id;
      user.name = result.user.name;
      user.email = result.user.email;
      user.role = result.user.role;
      user.mustChangePassword = result.user.mustChangePassword;
      return true;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (account?.provider === "google") {
        const googleEmail = (profile as { email?: string | null } | undefined)?.email;
        const email = (googleEmail ?? user?.email ?? token.email)?.toLowerCase().trim();
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.mustChangePassword = dbUser.mustChangePassword;
            token.name = dbUser.name;
            token.email = dbUser.email;
          }
        }
        return token;
      }

      return authConfig.callbacks.jwt({ token, user, trigger, session });
    },
  },
});
