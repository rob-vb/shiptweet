import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { repositories, commits, tweetSuggestions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Check if user has any connected repositories
  const userRepos = await db.query.repositories.findMany({
    where: and(
      eq(repositories.userId, session.user.id),
      eq(repositories.isActive, true)
    ),
  });

  if (userRepos.length === 0) {
    redirect("/repositories");
  }

  // Fetch recent commits with suggestions
  const recentCommits = await db.query.commits.findMany({
    where: eq(
      commits.repositoryId,
      userRepos.map((r) => r.id)[0] // Default to first repo
    ),
    orderBy: desc(commits.committedAt),
    limit: 20,
    with: {
      tweetSuggestions: true,
      repository: true,
    },
  });

  // Fetch pending suggestions
  const pendingSuggestions = await db.query.tweetSuggestions.findMany({
    where: and(
      eq(tweetSuggestions.userId, session.user.id),
      eq(tweetSuggestions.status, "pending")
    ),
    orderBy: desc(tweetSuggestions.createdAt),
    limit: 10,
    with: {
      commit: {
        with: {
          repository: true,
        },
      },
    },
  });

  // Stats
  const stats = {
    totalRepos: userRepos.length,
    totalCommits: recentCommits.length,
    pendingTweets: pendingSuggestions.length,
    postedTweets: await db.query.tweetSuggestions
      .findMany({
        where: and(
          eq(tweetSuggestions.userId, session.user.id),
          eq(tweetSuggestions.status, "posted")
        ),
      })
      .then((s) => s.length),
  };

  return (
    <DashboardClient
      repositories={userRepos}
      initialCommits={recentCommits}
      pendingSuggestions={pendingSuggestions}
      stats={stats}
      hasTwitter={session.user.hasTwitter}
    />
  );
}
