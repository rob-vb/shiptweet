import "server-only";
import { db } from "@/lib/db";
import { users, tweetSuggestions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface TwitterTokens {
  accessToken: string;
  refreshToken: string;
}

async function getTwitterTokens(userId: string): Promise<TwitterTokens | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.twitterAccessToken) {
    return null;
  }

  return {
    accessToken: user.twitterAccessToken,
    refreshToken: user.twitterRefreshToken || "",
  };
}

async function refreshTwitterToken(userId: string): Promise<string | null> {
  const tokens = await getTwitterTokens(userId);
  if (!tokens?.refreshToken) return null;

  try {
    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh Twitter token");
      return null;
    }

    const data = await response.json();

    // Update tokens in database
    await db
      .update(users)
      .set({
        twitterAccessToken: data.access_token,
        twitterRefreshToken: data.refresh_token,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Twitter token:", error);
    return null;
  }
}

export async function postTweet(
  userId: string,
  suggestionId: string
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  let tokens = await getTwitterTokens(userId);
  if (!tokens) {
    return { success: false, error: "Twitter not connected" };
  }

  const suggestion = await db.query.tweetSuggestions.findFirst({
    where: eq(tweetSuggestions.id, suggestionId),
  });

  if (!suggestion) {
    return { success: false, error: "Tweet suggestion not found" };
  }

  const postToTwitter = async (accessToken: string) => {
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: suggestion.content }),
    });

    return response;
  };

  let response = await postToTwitter(tokens.accessToken);

  // If unauthorized, try refreshing token
  if (response.status === 401) {
    const newToken = await refreshTwitterToken(userId);
    if (newToken) {
      response = await postToTwitter(newToken);
    }
  }

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.detail || "Failed to post tweet" };
  }

  const data = await response.json();

  // Update suggestion status
  await db
    .update(tweetSuggestions)
    .set({
      status: "posted",
      postedAt: new Date(),
      tweetId: data.data.id,
    })
    .where(eq(tweetSuggestions.id, suggestionId));

  return { success: true, tweetId: data.data.id };
}

export async function scheduleTweet(
  suggestionId: string,
  scheduledFor: Date
): Promise<void> {
  await db
    .update(tweetSuggestions)
    .set({
      status: "scheduled",
      scheduledFor,
    })
    .where(eq(tweetSuggestions.id, suggestionId));
}

export function generateTwitterShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
