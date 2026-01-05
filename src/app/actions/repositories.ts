"use server";

import { auth } from "@/lib/auth";
import { db, repositories, commits } from "@/lib/db";
import {
  fetchUserRepositories,
  connectRepository,
  disconnectRepository,
  syncRepositoryCommits,
  type GitHubRepo,
} from "@/lib/github";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getGitHubRepositories(): Promise<{
  success: boolean;
  repositories?: GitHubRepo[];
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const repos = await fetchUserRepositories(session.user.id);
    return { success: true, repositories: repos };
  } catch (error) {
    return { success: false, error: "Failed to fetch repositories" };
  }
}

export async function getConnectedRepositories() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const repos = await db.query.repositories.findMany({
    where: and(
      eq(repositories.userId, session.user.id),
      eq(repositories.isActive, true)
    ),
    orderBy: desc(repositories.createdAt),
  });

  return repos;
}

export async function connectGitHubRepository(repo: GitHubRepo): Promise<{
  success: boolean;
  repositoryId?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const repositoryId = await connectRepository(session.user.id, repo);

    // Initial sync of recent commits
    await syncRepositoryCommits(session.user.id, repositoryId);

    revalidatePath("/dashboard");
    return { success: true, repositoryId };
  } catch (error) {
    return { success: false, error: "Failed to connect repository" };
  }
}

export async function disconnectGitHubRepository(
  repositoryId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await disconnectRepository(repositoryId);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to disconnect repository" };
  }
}

export async function syncRepository(
  repositoryId: string,
  since?: Date,
  until?: Date
): Promise<{ success: boolean; newCommits?: number; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const newCommits = await syncRepositoryCommits(
      session.user.id,
      repositoryId,
      since,
      until
    );
    revalidatePath("/dashboard");
    return { success: true, newCommits };
  } catch (error) {
    return { success: false, error: "Failed to sync repository" };
  }
}

export async function getRepositoryCommits(
  repositoryId: string,
  options?: { since?: Date; until?: Date; limit?: number }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const conditions = [eq(commits.repositoryId, repositoryId)];

  if (options?.since) {
    conditions.push(gte(commits.committedAt, options.since));
  }
  if (options?.until) {
    conditions.push(lte(commits.committedAt, options.until));
  }

  const result = await db.query.commits.findMany({
    where: and(...conditions),
    orderBy: desc(commits.committedAt),
    limit: options?.limit || 50,
    with: {
      tweetSuggestions: true,
    },
  });

  return result;
}
