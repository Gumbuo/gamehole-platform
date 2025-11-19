import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { sql } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Check if user exists
        const existingUser = await sql`
          SELECT * FROM users WHERE email = ${user.email}
        `;

        if (existingUser.length === 0) {
          // Create new user
          await sql`
            INSERT INTO users (email, name, avatar, github_id)
            VALUES (${user.email}, ${user.name}, ${user.image}, ${account?.providerAccountId})
          `;
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        try {
          const user = await sql`
            SELECT id, email, name, avatar FROM users WHERE email = ${session.user.email}
          `;

          if (user.length > 0) {
            session.user.id = user[0].id;
          }
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
