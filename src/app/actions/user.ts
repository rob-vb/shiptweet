"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, type VoiceSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  return user;
}

export async function updateVoiceSettings(settings: VoiceSettings): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await db
      .update(users)
      .set({
        voiceSettings: settings,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update settings" };
  }
}

export async function getUserStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    with: {
      repositories: {
        where: eq(users.id, session.user.id),
      },
      tweetSuggestions: true,
    },
  });

  if (!user) return null;

  const activeRepos = user.repositories?.filter((r) => r.isActive).length || 0;
  const totalSuggestions = user.tweetSuggestions?.length || 0;
  const postedTweets =
    user.tweetSuggestions?.filter((t) => t.status === "posted").length || 0;
  const pendingSuggestions =
    user.tweetSuggestions?.filter((t) => t.status === "pending").length || 0;

  return {
    activeRepos,
    totalSuggestions,
    postedTweets,
    pendingSuggestions,
  };
}
