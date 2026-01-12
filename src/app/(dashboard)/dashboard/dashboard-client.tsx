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
  Zap,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Repository, Commit, TweetSuggestion } from "@/lib/db/schema";

interface CommitWithSuggestions extends Commit {
  tweetSuggestions: TweetSuggestion[];
  repository?: Repository;
}

interface CommitWithRepository extends Commit {
  repository?: Repository;
}

interface SuggestionWithCommit extends TweetSuggestion {
  commit?: CommitWithRepository | null;
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
        <Card className="border-secondary/30 bg-secondary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-secondary/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Connect X for direct posting
                </p>
                <p className="text-sm text-muted-foreground">
                  You can still copy tweets to clipboard without connecting.
                </p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-2">
                <Twitter className="h-4 w-4" />
                Connect
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-sm bg-accent/10 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-accent" />
              </div>
              <span className="text-3xl font-bold font-mono">{stats.totalRepos}</span>
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Repositories
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-sm bg-secondary/10 flex items-center justify-center">
                <FileCode className="h-5 w-5 text-secondary" />
              </div>
              <span className="text-3xl font-bold font-mono">{stats.totalCommits}</span>
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Commits
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-3xl font-bold font-mono">{stats.pendingTweets}</span>
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Pending
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-sm bg-success/10 flex items-center justify-center">
                <Send className="h-5 w-5 text-success" />
              </div>
              <span className="text-3xl font-bold font-mono">{stats.postedTweets}</span>
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Posted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Suggestions */}
      {pendingSuggestions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-accent/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base">Ready to Post</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pendingSuggestions.length} suggestions waiting
                </p>
              </div>
            </div>
            {pendingSuggestions.length > 4 && (
              <Link href="/queue">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {pendingSuggestions.slice(0, 4).map((suggestion) => (
                <TweetCard key={suggestion.id} suggestion={suggestion} showCommitInfo />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Repository & Commits Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center">
                <FileCode className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">Commits</CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Repository selector */}
              <select
                value={selectedRepo}
                onChange={(e) => handleRepoChange(e.target.value)}
                className="h-8 px-3 text-sm bg-input border border-border rounded-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
              >
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.fullName}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                Sync
              </Button>

              {unprocessedCount > 0 && (
                <Button
                  size="sm"
                  onClick={handleGenerateAll}
                  disabled={generating}
                  className="gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate ({unprocessedCount})
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <DateRangePicker onRangeChange={handleDateRangeChange} />
          </div>
        </CardHeader>
        <CardContent>
          <CommitList commits={commits} />
        </CardContent>
      </Card>
    </div>
  );
}
