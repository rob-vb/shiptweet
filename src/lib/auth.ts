import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Twitter from "next-auth/providers/twitter";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "tweet.read tweet.write users.read offline.access",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      let email = user.email;

      // If email is not provided (private GitHub email), fetch it from the API
      if (!email && account?.provider === "github" && account.access_token) {
        try {
          const res = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
              Accept: "application/vnd.github+json",
            },
          });
          const emails = await res.json();
          const primaryEmail = emails.find(
            (e: { primary: boolean; verified: boolean; email: string }) =>
              e.primary && e.verified
          );
          if (primaryEmail) {
            email = primaryEmail.email;
            user.email = email;
          }
        } catch (e) {
          console.error("Failed to fetch GitHub emails:", e);
        }
      }

      if (!email) return false;

      try {
        // Check if user exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (account?.provider === "github") {
          if (existingUser) {
            // Update GitHub info
            await db
              .update(users)
              .set({
                githubId: account.providerAccountId,
                githubAccessToken: account.access_token,
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                updatedAt: new Date(),
              })
              .where(eq(users.id, existingUser.id));
          } else {
            // Create new user
            await db.insert(users).values({
              email: email,
              name: user.name,
              image: user.image,
              githubId: account.providerAccountId,
              githubAccessToken: account.access_token,
            });
          }
        }

        if (account?.provider === "twitter") {
          if (existingUser) {
            // Update Twitter info
            await db
              .update(users)
              .set({
                twitterId: account.providerAccountId,
                twitterAccessToken: account.access_token,
                twitterRefreshToken: account.refresh_token,
                updatedAt: new Date(),
              })
              .where(eq(users.id, existingUser.id));
          }
          // For Twitter-only signups, we need GitHub first
          if (!existingUser) {
            return "/auth/connect-github";
          }
        }

        return true;
      } catch (error) {
        console.error("Sign in database error:", error);
        console.error("Error details:", {
          name: (error as Error)?.name,
          message: (error as Error)?.message,
          email: email,
          provider: account?.provider,
        });
        return false;
      }
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, session.user.email!),
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.plan = dbUser.plan;
          session.user.hasGithub = !!dbUser.githubId;
          session.user.hasTwitter = !!dbUser.twitterId;
        }
      }
      return session;
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
