"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TweetCard } from "@/components/tweet-card";
import { MessageSquare, Send, Clock, CheckCircle } from "lucide-react";
import type { TweetSuggestion, Commit, Repository } from "@/lib/db/schema";

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
}: QueueClientProps) {
  const pending = suggestions.filter((s) => s.status === "pending");
  const accepted = suggestions.filter((s) => s.status === "accepted");
  const scheduled = suggestions.filter((s) => s.status === "scheduled");

  const tabs: { id: TabType; label: string; count: number; icon: typeof MessageSquare }[] = [
    { id: "pending", label: "Pending", count: pending.length, icon: MessageSquare },
    { id: "accepted", label: "Accepted", count: accepted.length, icon: CheckCircle },
    { id: "scheduled", label: "Scheduled", count: scheduled.length, icon: Clock },
    { id: "posted", label: "Posted", count: postedSuggestions.length, icon: Send },
  ];

  const getSuggestionsByTab = (tabId: TabType) => {
    switch (tabId) {
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

  const renderEmptyState = (tabId: TabType) => (
    <Card>
      <CardContent className="py-12 text-center">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-medium mb-2">No {tabId} tweets</h3>
        <p className="text-sm text-muted-foreground">
          {tabId === "pending" &&
            "Generate tweets from your commits to see them here."}
          {tabId === "accepted" &&
            "Accept tweet suggestions to add them to your queue."}
          {tabId === "scheduled" && "Schedule tweets for later posting."}
          {tabId === "posted" && "Your posted tweets will appear here."}
        </p>
      </CardContent>
    </Card>
  );

  const renderSuggestions = (tabSuggestions: SuggestionWithCommit[]) => (
    <div className="grid gap-4 md:grid-cols-2">
      {tabSuggestions.map((suggestion) => (
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
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tweet Queue</h1>
        <p className="text-muted-foreground mt-1">
          Manage your tweet suggestions and track what you've posted.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="flex flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <TabsTrigger key={tab.id} value={tab.id}>
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <Badge variant="muted" className="ml-1">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => {
          const tabSuggestions = getSuggestionsByTab(tab.id);

          return (
            <TabsContent key={tab.id} value={tab.id}>
              {tabSuggestions.length === 0
                ? renderEmptyState(tab.id)
                : renderSuggestions(tabSuggestions)}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
