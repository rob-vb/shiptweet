"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommitList } from "@/components/commit-list";
import { TweetCard } from "@/components/tweet-card";
import { DateRangePicker } from "@/components/date-range-picker";
import { syncRepository, getRepositoryCommits } from "@/app/actions/repositories";
import { generateTweetsForCommits } from "@/app/actions/tweets";
import {
  GitBranch,
  RefreshCw,
  Sparkles,
  Send,
  FileCode,
  MessageSquare,
  Twitter,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type { Repository, Commit, TweetSuggestion } from "@/lib/db/schema";

interface CommitWithSuggestions extends Commit {
  tweetSuggestions: TweetSuggestion[];
  repository?: Repository;
}

interface SuggestionWithCommit extends TweetSuggestion {
  commit?: CommitWithSuggestions | null;
}

interface DashboardClientProps {
  repositories: Repository[];
  initialCommits: CommitWithSuggestions[];
  pendingSuggestions: SuggestionWithCommit[];
  stats: {
    totalRepos: number;
    totalCommits: number;
    pendingTweets: number;
    postedTweets: number;
  };
  hasTwitter: boolean;
}

export function DashboardClient({
  repositories,
  initialCommits,
  pendingSuggestions,
  stats,
  hasTwitter,
}: DashboardClientProps) {
  const [selectedRepo, setSelectedRepo] = useState<string>(repositories[0]?.id || "");
  const [commits, setCommits] = useState<CommitWithSuggestions[]>(initialCommits);
  const [syncing, setSyncing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState<{ since?: Date; until?: Date }>({});

  const handleSync = async () => {
    if (!selectedRepo) return;
    setSyncing(true);
    try {
      await syncRepository(selectedRepo, dateRange.since, dateRange.until);
      const newCommits = await getRepositoryCommits(selectedRepo, {
        since: dateRange.since,
        until: dateRange.until,
      });
      setCommits(newCommits as CommitWithSuggestions[]);
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateAll = async () => {
    const unprocessedCommits = commits.filter(
      (c) => !c.processedAt && c.tweetSuggestions.length === 0
    );
    if (unprocessedCommits.length === 0) return;

    setGenerating(true);
    try {
      await generateTweetsForCommits(unprocessedCommits.map((c) => c.id));
      // Refresh commits
      const newCommits = await getRepositoryCommits(selectedRepo, {
        since: dateRange.since,
        until: dateRange.until,
      });
      setCommits(newCommits as CommitWithSuggestions[]);
    } finally {
      setGenerating(false);
    }
  };

  const handleRepoChange = async (repoId: string) => {
    setSelectedRepo(repoId);
    const newCommits = await getRepositoryCommits(repoId, {
      since: dateRange.since,
      until: dateRange.until,
    });
    setCommits(newCommits as CommitWithSuggestions[]);
  };

  const handleDateRangeChange = async (since?: Date, until?: Date) => {
    setDateRange({ since, until });
    if (selectedRepo) {
      const newCommits = await getRepositoryCommits(selectedRepo, { since, until });
      setCommits(newCommits as CommitWithSuggestions[]);
    }
  };

  const unprocessedCount = commits.filter(
    (c) => !c.processedAt && c.tweetSuggestions.length === 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Twitter Connection Warning */}
      {!hasTwitter && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">
                  Connect X (Twitter) for direct posting
                </p>
                <p className="text-sm text-yellow-700">
                  You can still copy tweets to clipboard without connecting.
                </p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Twitter className="mr-2 h-4 w-4" />
                Connect X
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.totalRepos}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Connected Repos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.totalCommits}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Recent Commits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.pendingTweets}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Pending Tweets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.postedTweets}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Posted Tweets</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Suggestions */}
      {pendingSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-500" />
              Ready to Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {pendingSuggestions.slice(0, 4).map((suggestion) => (
                <TweetCard key={suggestion.id} suggestion={suggestion} showCommitInfo />
              ))}
            </div>
            {pendingSuggestions.length > 4 && (
              <div className="mt-4 text-center">
                <Link href="/queue">
                  <Button variant="outline">
                    View All {pendingSuggestions.length} Suggestions
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Repository & Commits Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">Commits</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedRepo}
                onChange={(e) => handleRepoChange(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.fullName}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
                Sync
              </Button>
              {unprocessedCount > 0 && (
                <Button size="sm" onClick={handleGenerateAll} disabled={generating}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate All ({unprocessedCount})
                </Button>
              )}
            </div>
          </div>
          <DateRangePicker onRangeChange={handleDateRangeChange} />
        </CardHeader>
        <CardContent>
          <CommitList commits={commits} />
        </CardContent>
      </Card>
    </div>
  );
}
