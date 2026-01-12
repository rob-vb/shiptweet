"use client";

import { useState } from "react";
import { formatRelativeTime, getTweetabilityLabel, getCommitTypeEmoji } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TweetCard } from "@/components/tweet-card";
import { generateTweetsForCommit, generateCombinedTweet } from "@/app/actions/tweets";
import {
  GitCommit,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileCode,
  Plus,
  Minus,
  CheckSquare,
  Square,
  Layers,
  Zap,
} from "lucide-react";
import type { Commit, TweetSuggestion, Repository } from "@/lib/db/schema";

interface CommitWithSuggestions extends Commit {
  tweetSuggestions: TweetSuggestion[];
  repository?: Repository;
}

interface CommitListProps {
  commits: CommitWithSuggestions[];
  showRepository?: boolean;
}

// Tweetability score ring component
function ScoreRing({ score }: { score: number }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const scoreClass = score >= 70 ? "text-success" : score >= 40 ? "text-secondary" : "text-muted-foreground";

  return (
    <div className="score-ring relative w-10 h-10">
      <svg className="w-10 h-10" viewBox="0 0 36 36">
        {/* Background circle */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-border"
        />
        {/* Progress circle */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={scoreClass}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-xs font-mono font-bold ${scoreClass}`}>
        {score}
      </span>
    </div>
  );
}

export function CommitList({ commits, showRepository = false }: CommitListProps) {
  const [expandedCommit, setExpandedCommit] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedCommits, setSelectedCommits] = useState<Set<string>>(new Set());
  const [generatingCombined, setGeneratingCombined] = useState(false);

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

  const toggleCommitSelection = (commitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCommits((prev) => {
      const next = new Set(prev);
      if (next.has(commitId)) {
        next.delete(commitId);
      } else {
        next.add(commitId);
      }
      return next;
    });
  };

  const handleGenerateCombined = async () => {
    if (selectedCommits.size < 2) return;
    setGeneratingCombined(true);
    try {
      const result = await generateCombinedTweet(Array.from(selectedCommits));
      if (result.success) {
        setSelectedCommits(new Set());
      }
    } catch (error) {
      console.error("Failed to generate combined tweet:", error);
    } finally {
      setGeneratingCombined(false);
    }
  };

  const selectAll = () => {
    setSelectedCommits(new Set(commits.map((c) => c.id)));
  };

  const clearSelection = () => {
    setSelectedCommits(new Set());
  };

  if (commits.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-muted flex items-center justify-center">
          <GitCommit className="h-8 w-8 opacity-50" />
        </div>
        <p className="text-lg font-medium mb-1">No commits found</p>
        <p className="text-sm">Sync a repository to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selection toolbar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-sm p-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectedCommits.size === commits.length ? clearSelection : selectAll}
            className="gap-1.5"
          >
            {selectedCommits.size === commits.length ? (
              <CheckSquare className="h-4 w-4 text-accent" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedCommits.size === commits.length ? "Deselect" : "Select All"}
          </Button>
          {selectedCommits.size > 0 && (
            <span className="text-sm text-muted-foreground font-mono">
              {selectedCommits.size} selected
            </span>
          )}
        </div>
        {selectedCommits.size >= 2 && (
          <Button
            size="sm"
            onClick={handleGenerateCombined}
            disabled={generatingCombined}
            className="gap-1.5"
          >
            {generatingCombined ? (
              <Sparkles className="h-4 w-4 animate-pulse" />
            ) : (
              <Layers className="h-4 w-4" />
            )}
            Combine ({selectedCommits.size})
          </Button>
        )}
      </div>

      {commits.map((commit) => {
        const isExpanded = expandedCommit === commit.id;
        const { label, className } = getTweetabilityLabel(commit.tweetabilityScore);
        const hasSuggestions = commit.tweetSuggestions.length > 0;
        const isSelected = selectedCommits.has(commit.id);

        return (
          <Card
            key={commit.id}
            className={`overflow-hidden transition-all ${isSelected ? "ring-1 ring-primary/50 bg-muted/50" : ""}`}
          >
            <div
              className="p-4 cursor-pointer hover:bg-card-elevated/50 transition-colors"
              onClick={() => setExpandedCommit(isExpanded ? null : commit.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => toggleCommitSelection(commit.id, e)}
                    className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-accent" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>

                  {/* Tweetability score */}
                  <ScoreRing score={commit.tweetabilityScore || 0} />

                  <div className="flex-1 min-w-0">
                    {/* Commit title */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">
                        {getCommitTypeEmoji(commit.commitType)}
                      </span>
                      <p className="font-medium truncate text-foreground">
                        {commit.aiSummary || commit.message.split("\n")[0]}
                      </p>
                    </div>

                    {/* Commit metadata */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {showRepository && commit.repository && (
                        <span className="flex items-center gap-1">
                          <FileCode className="h-3 w-3" />
                          <span className="font-mono text-xs">{commit.repository.name}</span>
                        </span>
                      )}
                      <span className="font-mono text-xs">{formatRelativeTime(commit.committedAt)}</span>
                      <span className="flex items-center gap-1 font-mono text-xs">
                        <Plus className="h-3 w-3 text-success" />
                        {commit.additions}
                        <Minus className="h-3 w-3 text-destructive ml-1" />
                        {commit.deletions}
                      </span>
                      <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded-sm font-mono">
                        {commit.sha.slice(0, 7)}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={className}>{label}</Badge>
                  {hasSuggestions && (
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="h-3 w-3" />
                      {commit.tweetSuggestions.length}
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
              <CardContent className="border-t border-border/50 bg-background/50 pt-4">
                {commit.message !== commit.aiSummary && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      Original commit message
                    </p>
                    <pre className="text-sm bg-muted/50 p-3 rounded-sm whitespace-pre-wrap font-mono text-muted-foreground border border-border/50">
                      {commit.message}
                    </pre>
                  </div>
                )}

                {!hasSuggestions ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-sm bg-accent/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-accent" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Generate tweet suggestions for this commit
                    </p>
                    <Button
                      onClick={() => handleGenerateTweets(commit.id)}
                      disabled={generating === commit.id}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {generating === commit.id ? "Generating..." : "Generate Tweets"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        Tweet Suggestions
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateTweets(commit.id)}
                        disabled={generating === commit.id}
                        className="gap-1 text-xs"
                      >
                        <Sparkles className="h-3 w-3" />
                        {generating === commit.id ? "Regenerating..." : "Regenerate"}
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
