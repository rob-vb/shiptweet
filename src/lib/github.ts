import "server-only";
import { Octokit } from "octokit";
import { db } from "@/lib/db";
import { users, repositories, commits, type FileChange } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Re-export types for server-side usage
export type { GitHubRepo, GitHubCommit, FileChange } from "@/types/github";
import type { GitHubRepo } from "@/types/github";

export async function getOctokit(userId: string): Promise<Octokit | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.githubAccessToken) {
    return null;
  }

  return new Octokit({ auth: user.githubAccessToken });
}

export async function fetchUserRepositories(userId: string): Promise<GitHubRepo[]> {
  const octokit = await getOctokit(userId);
  if (!octokit) {
    throw new Error("GitHub not connected");
  }

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "pushed",
    per_page: 100,
    type: "owner",
  });

  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    private: repo.private,
    default_branch: repo.default_branch,
    html_url: repo.html_url,
    pushed_at: repo.pushed_at,
  }));
}

import type { GitHubCommit, FileChange as GitHubFileChange } from "@/types/github";

export async function fetchRepositoryCommits(
  userId: string,
  repoFullName: string,
  since?: Date,
  until?: Date
): Promise<GitHubCommit[]> {
  const octokit = await getOctokit(userId);
  if (!octokit) {
    throw new Error("GitHub not connected");
  }

  const [owner, repo] = repoFullName.split("/");

  // Fetch commits list
  const { data: commitsList } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    per_page: 50,
    since: since?.toISOString(),
    until: until?.toISOString(),
  });

  // Fetch detailed info for each commit (includes file changes)
  const detailedCommits = await Promise.all(
    commitsList.slice(0, 20).map(async (commit) => {
      try {
        const { data: detail } = await octokit.rest.repos.getCommit({
          owner,
          repo,
          ref: commit.sha,
        });

        const filesChanged: FileChange[] = (detail.files || []).map((file) => ({
          filename: file.filename,
          status: file.status as FileChange["status"],
          additions: file.additions,
          deletions: file.deletions,
          patch: file.patch?.slice(0, 2000), // Limit patch size
        }));

        return {
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author?.name || null,
          authorEmail: commit.commit.author?.email || null,
          committedAt: new Date(commit.commit.author?.date || Date.now()),
          additions: detail.stats?.additions || 0,
          deletions: detail.stats?.deletions || 0,
          filesChanged,
        };
      } catch (error) {
        // If we can't get details, return basic info
        return {
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author?.name || null,
          authorEmail: commit.commit.author?.email || null,
          committedAt: new Date(commit.commit.author?.date || Date.now()),
          additions: 0,
          deletions: 0,
          filesChanged: [],
        };
      }
    })
  );

  return detailedCommits;
}

export async function syncRepositoryCommits(
  userId: string,
  repositoryId: string,
  since?: Date,
  until?: Date
): Promise<number> {
  const repository = await db.query.repositories.findFirst({
    where: eq(repositories.id, repositoryId),
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const githubCommits = await fetchRepositoryCommits(
    userId,
    repository.fullName,
    since,
    until
  );

  // Get existing commit SHAs to avoid duplicates
  const existingCommits = await db.query.commits.findMany({
    where: eq(commits.repositoryId, repositoryId),
    columns: { sha: true },
  });
  const existingShas = new Set(existingCommits.map((c) => c.sha));

  // Insert new commits
  const newCommits = githubCommits.filter((c) => !existingShas.has(c.sha));

  if (newCommits.length > 0) {
    await db.insert(commits).values(
      newCommits.map((commit) => ({
        repositoryId,
        sha: commit.sha,
        message: commit.message,
        author: commit.author,
        authorEmail: commit.authorEmail,
        filesChanged: commit.filesChanged,
        additions: commit.additions,
        deletions: commit.deletions,
        committedAt: commit.committedAt,
      }))
    );
  }

  // Update last synced
  await db
    .update(repositories)
    .set({ lastSyncedAt: new Date() })
    .where(eq(repositories.id, repositoryId));

  return newCommits.length;
}

export async function connectRepository(
  userId: string,
  githubRepo: GitHubRepo
): Promise<string> {
  // Check if already connected
  const existing = await db.query.repositories.findFirst({
    where: eq(repositories.githubRepoId, githubRepo.id),
  });

  if (existing) {
    // Reactivate if inactive
    if (!existing.isActive) {
      await db
        .update(repositories)
        .set({ isActive: true })
        .where(eq(repositories.id, existing.id));
    }
    return existing.id;
  }

  // Create new repository connection
  const [newRepo] = await db
    .insert(repositories)
    .values({
      userId,
      githubRepoId: githubRepo.id,
      name: githubRepo.name,
      fullName: githubRepo.full_name,
      description: githubRepo.description,
      defaultBranch: githubRepo.default_branch,
      isPrivate: githubRepo.private,
    })
    .returning({ id: repositories.id });

  return newRepo.id;
}

export async function disconnectRepository(repositoryId: string): Promise<void> {
  await db
    .update(repositories)
    .set({ isActive: false })
    .where(eq(repositories.id, repositoryId));
}
