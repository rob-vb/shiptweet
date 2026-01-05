"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TweetCard } from "@/components/tweet-card";
import { MessageSquare, Send, Clock, CheckCircle } from "lucide-react";
import type { TweetSuggestion, Commit, Repository } from "@/lib/db";

interface SuggestionWithCommit extends TweetSuggestion {
  commit?: (Commit & { repository?: Repository }) | null;
}

interface QueueClientProps {
  suggestions: SuggestionWithCommit[];
  postedSuggestions: SuggestionWithCommit[];
  hasTwitter: boolean;
}

type TabType = "pending" | "accepted" | "scheduled" | "posted";

export function QueueClient({
  suggestions,
  postedSuggestions,
  hasTwitter,
}: QueueClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  const pending = suggestions.filter((s) => s.status === "pending");
  const accepted = suggestions.filter((s) => s.status === "accepted");
  const scheduled = suggestions.filter((s) => s.status === "scheduled");

  const tabs: { id: TabType; label: string; count: number; icon: typeof MessageSquare }[] = [
    { id: "pending", label: "Pending", count: pending.length, icon: MessageSquare },
    { id: "accepted", label: "Accepted", count: accepted.length, icon: CheckCircle },
    { id: "scheduled", label: "Scheduled", count: scheduled.length, icon: Clock },
    { id: "posted", label: "Posted", count: postedSuggestions.length, icon: Send },
  ];

  const getCurrentSuggestions = () => {
    switch (activeTab) {
      case "pending":
        return pending;
      case "accepted":
        return accepted;
      case "scheduled":
        return scheduled;
      case "posted":
        return postedSuggestions;
      default:
        return [];
    }
  };

  const currentSuggestions = getCurrentSuggestions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tweet Queue</h1>
        <p className="text-muted-foreground mt-1">
          Manage your tweet suggestions and track what you've posted.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-brand-500 text-white"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
              <Badge
                variant={isActive ? "secondary" : "default"}
                className={isActive ? "bg-white/20 text-white" : ""}
              >
                {tab.count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {currentSuggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No {activeTab} tweets</h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === "pending" &&
                "Generate tweets from your commits to see them here."}
              {activeTab === "accepted" &&
                "Accept tweet suggestions to add them to your queue."}
              {activeTab === "scheduled" && "Schedule tweets for later posting."}
              {activeTab === "posted" && "Your posted tweets will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {currentSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="space-y-2">
              {suggestion.commit?.repository && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">
                    {suggestion.commit.repository.name}
                  </span>
                  <span>-</span>
                  <span className="truncate">
                    {suggestion.commit.aiSummary || suggestion.commit.message}
                  </span>
                </div>
              )}
              <TweetCard suggestion={suggestion} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
