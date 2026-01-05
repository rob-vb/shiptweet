"use server";

import { auth } from "@/lib/auth";
import { db, tweetSuggestions, commits } from "@/lib/db";
import { processCommit, processMultipleCommits } from "@/lib/ai/generate-tweets";
import { postTweet, scheduleTweet } from "@/lib/twitter";
import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function generateTweetsForCommit(commitId: string): Promise<{
  success: boolean;
  suggestionsCreated?: number;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const result = await processCommit(commitId, session.user.id);
    revalidatePath("/dashboard");
    return { success: true, suggestionsCreated: result.suggestionsCreated };
  } catch (error) {
    console.error("Error generating tweets:", error);
    return { success: false, error: "Failed to generate tweets" };
  }
}

export async function generateTweetsForCommits(commitIds: string[]): Promise<{
  success: boolean;
  processed?: number;
  totalSuggestions?: number;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const result = await processMultipleCommits(commitIds, session.user.id);
    revalidatePath("/dashboard");
    return {
      success: true,
      processed: result.processed,
      totalSuggestions: result.totalSuggestions,
    };
  } catch (error) {
    console.error("Error generating tweets:", error);
    return { success: false, error: "Failed to generate tweets" };
  }
}

export async function getTweetSuggestions(options?: {
  status?: string;
  commitId?: string;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const conditions = [eq(tweetSuggestions.userId, session.user.id)];

  if (options?.status) {
    conditions.push(eq(tweetSuggestions.status, options.status));
  }
  if (options?.commitId) {
    conditions.push(eq(tweetSuggestions.commitId, options.commitId));
  }

  const suggestions = await db.query.tweetSuggestions.findMany({
    where: and(...conditions),
    orderBy: desc(tweetSuggestions.createdAt),
    limit: options?.limit || 50,
    with: {
      commit: {
        with: {
          repository: true,
        },
      },
    },
  });

  return suggestions;
}

export async function updateSuggestionStatus(
  suggestionId: string,
  status: "pending" | "accepted" | "rejected" | "posted" | "scheduled"
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await db
      .update(tweetSuggestions)
      .set({ status })
      .where(
        and(
          eq(tweetSuggestions.id, suggestionId),
          eq(tweetSuggestions.userId, session.user.id)
        )
      );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}

export async function updateSuggestionContent(
  suggestionId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (content.length > 280) {
    return { success: false, error: "Tweet exceeds 280 characters" };
  }

  try {
    await db
      .update(tweetSuggestions)
      .set({ content })
      .where(
        and(
          eq(tweetSuggestions.id, suggestionId),
          eq(tweetSuggestions.userId, session.user.id)
        )
      );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update content" };
  }
}

export async function postTweetSuggestion(suggestionId: string): Promise<{
  success: boolean;
  tweetId?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!session.user.hasTwitter) {
    return { success: false, error: "Twitter not connected" };
  }

  try {
    const result = await postTweet(session.user.id, suggestionId);
    revalidatePath("/dashboard");
    return result;
  } catch (error) {
    return { success: false, error: "Failed to post tweet" };
  }
}

export async function scheduleTweetSuggestion(
  suggestionId: string,
  scheduledFor: Date
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await scheduleTweet(suggestionId, scheduledFor);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to schedule tweet" };
  }
}

export async function deleteSuggestion(
  suggestionId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await db
      .delete(tweetSuggestions)
      .where(
        and(
          eq(tweetSuggestions.id, suggestionId),
          eq(tweetSuggestions.userId, session.user.id)
        )
      );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete suggestion" };
  }
}
