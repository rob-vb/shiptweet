// Client-safe GitHub types (no server dependencies)

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  html_url: string;
  pushed_at: string | null;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string | null;
  authorEmail: string | null;
  committedAt: Date;
  additions: number;
  deletions: number;
  filesChanged: FileChange[];
}

export interface FileChange {
  filename: string;
  status: "added" | "modified" | "removed" | "renamed";
  additions: number;
  deletions: number;
  patch?: string;
}
