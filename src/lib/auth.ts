import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { resolveInternalRedirect } from "@/lib/site-url";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) return null;
        if (credentials?.password === adminPassword) {
          return { id: "1", name: "Admin", email: "admin@portfolio.local" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // NextAuth derives baseUrl from the request host, which is the internal
    // localhost:31000 behind the proxy — so resolve redirect targets against
    // the trusted site origin instead (and reject off-site targets).
    redirect({ url, baseUrl }) {
      return resolveInternalRedirect(url, baseUrl);
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
