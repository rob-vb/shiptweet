import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, tweetSuggestions } from "@/lib/db";
import { eq, desc, and, or } from "drizzle-orm";
import { QueueClient } from "./queue-client";

export default async function QueuePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch all suggestions grouped by status
  const allSuggestions = await db.query.tweetSuggestions.findMany({
    where: and(
      eq(tweetSuggestions.userId, session.user.id),
      or(
        eq(tweetSuggestions.status, "pending"),
        eq(tweetSuggestions.status, "accepted"),
        eq(tweetSuggestions.status, "scheduled")
      )
    ),
    orderBy: desc(tweetSuggestions.createdAt),
    with: {
      commit: {
        with: {
          repository: true,
        },
      },
    },
  });

  const postedSuggestions = await db.query.tweetSuggestions.findMany({
    where: and(
      eq(tweetSuggestions.userId, session.user.id),
      eq(tweetSuggestions.status, "posted")
    ),
    orderBy: desc(tweetSuggestions.postedAt),
    limit: 20,
    with: {
      commit: {
        with: {
          repository: true,
        },
      },
    },
  });

  return (
    <QueueClient
      suggestions={allSuggestions}
      postedSuggestions={postedSuggestions}
      hasTwitter={session.user.hasTwitter}
    />
  );
}
