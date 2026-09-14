import type { NextAuthConfig } from "next-auth";

const dashboardHome: Record<string, string> = {
  admin: "/dashboard/admin",
  cafeteria: "/dashboard/cafeteria",
  runner: "/dashboard/runner",
  student: "/dashboard/student",
};

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword ?? false;
      }
      if (trigger === "update" && session) {
        const next = session as {
          name?: string | null;
          mustChangePassword?: boolean;
          user?: { name?: string | null; mustChangePassword?: boolean };
        };
        token.mustChangePassword =
          next.user?.mustChangePassword ?? next.mustChangePassword ?? token.mustChangePassword;
        token.name = next.user?.name ?? next.name ?? token.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as (typeof session.user)["role"];
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;
      const isLoggedIn = Boolean(auth?.user);

      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/signup");
      const isDashboard = pathname.startsWith("/dashboard");
      const isChangePassword = pathname.startsWith("/change-password");

      if (isAuthPage) {
        if (isLoggedIn && role) {
          return Response.redirect(new URL(dashboardHome[role] ?? "/", request.nextUrl));
        }
        return true;
      }

      if (isChangePassword) {
        return isLoggedIn;
      }

      if (!isDashboard) return true;
      if (!isLoggedIn || !role) return false;

      if (auth.user.mustChangePassword && !isChangePassword) {
        return Response.redirect(new URL("/change-password", request.nextUrl));
      }

      if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
        return Response.redirect(new URL(dashboardHome[role], request.nextUrl));
      }
      if (pathname.startsWith("/dashboard/cafeteria") && role !== "cafeteria") {
        return Response.redirect(new URL(dashboardHome[role], request.nextUrl));
      }
      if (pathname.startsWith("/dashboard/runner") && role !== "runner") {
        return Response.redirect(new URL(dashboardHome[role], request.nextUrl));
      }
      if (pathname.startsWith("/dashboard/student") && role !== "student") {
        return Response.redirect(new URL(dashboardHome[role], request.nextUrl));
      }

      if (pathname === "/dashboard") {
        return Response.redirect(new URL(dashboardHome[role], request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

export const DASHBOARD_HOME = dashboardHome;
