"use client";

import { useState } from "react";
import { formatRelativeTime, getTweetabilityLabel, getCommitTypeEmoji } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TweetCard } from "@/components/tweet-card";
import { generateTweetsForCommit } from "@/app/actions/tweets";
import {
  GitCommit,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileCode,
  Plus,
  Minus,
} from "lucide-react";
import type { Commit, TweetSuggestion, Repository } from "@/lib/db";

interface CommitWithSuggestions extends Commit {
  tweetSuggestions: TweetSuggestion[];
  repository?: Repository;
}

interface CommitListProps {
  commits: CommitWithSuggestions[];
  showRepository?: boolean;
}

export function CommitList({ commits, showRepository = false }: CommitListProps) {
  const [expandedCommit, setExpandedCommit] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerateTweets = async (commitId: string) => {
    setGenerating(commitId);
    try {
      await generateTweetsForCommit(commitId);
    } catch (error) {
      console.error("Failed to generate tweets:", error);
    } finally {
      setGenerating(null);
    }
  };

  if (commits.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <GitCommit className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No commits found. Sync a repository to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {commits.map((commit) => {
        const isExpanded = expandedCommit === commit.id;
        const { label, className } = getTweetabilityLabel(commit.tweetabilityScore);
        const hasSuggestions = commit.tweetSuggestions.length > 0;

        return (
          <Card key={commit.id} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedCommit(isExpanded ? null : commit.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {getCommitTypeEmoji(commit.commitType)}
                    </span>
                    <p className="font-medium truncate">
                      {commit.aiSummary || commit.message.split("\n")[0]}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {showRepository && commit.repository && (
                      <span className="flex items-center gap-1">
                        <FileCode className="h-3 w-3" />
                        {commit.repository.name}
                      </span>
                    )}
                    <span>{formatRelativeTime(commit.committedAt)}</span>
                    <span className="flex items-center gap-1">
                      <Plus className="h-3 w-3 text-green-600" />
                      {commit.additions}
                      <Minus className="h-3 w-3 text-red-600 ml-1" />
                      {commit.deletions}
                    </span>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {commit.sha.slice(0, 7)}
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={className}>{label}</Badge>
                  {hasSuggestions && (
                    <Badge variant="success">
                      {commit.tweetSuggestions.length} tweets
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <CardContent className="border-t bg-muted/30">
                {commit.message !== commit.aiSummary && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Original commit message:
                    </p>
                    <pre className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                      {commit.message}
                    </pre>
                  </div>
                )}

                {!hasSuggestions ? (
                  <div className="text-center py-6">
                    <Sparkles className="mx-auto h-8 w-8 text-brand-500 mb-2" />
                    <p className="text-muted-foreground mb-4">
                      Generate tweet suggestions for this commit
                    </p>
                    <Button
                      onClick={() => handleGenerateTweets(commit.id)}
                      isLoading={generating === commit.id}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Tweets
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Tweet Suggestions</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateTweets(commit.id)}
                        isLoading={generating === commit.id}
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Regenerate
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {commit.tweetSuggestions.map((suggestion) => (
                        <TweetCard key={suggestion.id} suggestion={suggestion} />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
