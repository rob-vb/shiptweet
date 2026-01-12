"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { calculateCharCount, isValidTweetLength, generateTwitterShareUrl } from "@/lib/utils";
import {
  updateSuggestionContent,
  updateSuggestionStatus,
  postTweetSuggestion,
  deleteSuggestion,
} from "@/app/actions/tweets";
import {
  Copy,
  Check,
  X,
  Edit2,
  ExternalLink,
  Trash2,
  Twitter,
  MessageCircle,
  Heart,
  Repeat2,
  BarChart3,
} from "lucide-react";
import type { TweetSuggestion } from "@/lib/db/schema";

interface TweetCardProps {
  suggestion: TweetSuggestion;
  showCommitInfo?: boolean;
}

export function TweetCard({ suggestion, showCommitInfo = false }: TweetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(suggestion.content);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const charCount = calculateCharCount(editContent);
  const isValid = isValidTweetLength(editContent);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(suggestion.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await updateSuggestionContent(suggestion.id, editContent);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await updateSuggestionStatus(suggestion.id, "accepted");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await updateSuggestionStatus(suggestion.id, "rejected");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      const result = await postTweetSuggestion(suggestion.id);
      if (!result.success) {
        window.open(generateTwitterShareUrl(suggestion.content), "_blank");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteSuggestion(suggestion.id);
    } finally {
      setLoading(false);
    }
  };

  const toneConfig: Record<string, { color: string; label: string }> = {
    casual: { color: "bg-blue-500/15 text-blue-400 border-blue-500/30", label: "casual" },
    professional: { color: "bg-purple-500/15 text-purple-400 border-purple-500/30", label: "pro" },
    excited: { color: "bg-accent/15 text-accent border-accent/30", label: "excited" },
    technical: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", label: "tech" },
  };

  const statusConfig: Record<string, { variant: "default" | "success" | "warning" | "destructive" | "muted"; label: string }> = {
    pending: { variant: "muted", label: "draft" },
    accepted: { variant: "success", label: "ready" },
    posted: { variant: "success", label: "posted" },
    rejected: { variant: "destructive", label: "rejected" },
    scheduled: { variant: "warning", label: "scheduled" },
  };

  if (suggestion.status === "rejected") {
    return null;
  }

  const charCountClass = charCount > 280 ? "text-destructive" : charCount > 250 ? "text-secondary" : "text-muted-foreground";

  return (
    <div className="tweet-card group">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-2">
          <Badge className={toneConfig[suggestion.tone]?.color || toneConfig.casual.color}>
            {toneConfig[suggestion.tone]?.label || suggestion.tone}
          </Badge>
          {suggestion.tweetType && (
            <Badge variant="muted" className="text-[10px] uppercase tracking-wider">
              {suggestion.tweetType}
            </Badge>
          )}
        </div>
        <Badge variant={statusConfig[suggestion.status]?.variant || "muted"}>
          {statusConfig[suggestion.status]?.label || suggestion.status}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[120px] bg-input border-border focus:border-accent resize-none"
              placeholder="Write your tweet..."
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs ${charCountClass}`}>
                  {charCount}/280
                </span>
                {charCount > 280 && (
                  <span className="text-[10px] text-destructive uppercase tracking-wider">
                    Too long
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(suggestion.content);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!isValid}
                  isLoading={loading}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">
              {suggestion.content}
            </p>

            {/* Fake tweet engagement preview */}
            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border/50 text-muted-foreground">
              <span className="flex items-center gap-1.5 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="font-mono">—</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <Repeat2 className="h-3.5 w-3.5" />
                <span className="font-mono">—</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <Heart className="h-3.5 w-3.5" />
                <span className="font-mono">—</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="font-mono">—</span>
              </span>
              <span className="ml-auto font-mono text-xs">
                {charCount}/280
              </span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-card-elevated/50">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 px-2"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(generateTwitterShareUrl(suggestion.content), "_blank")
              }
              className="h-8 px-2"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            {suggestion.status === "pending" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReject}
                  className="h-8 px-2 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAccept}
                  className="h-8 px-2 hover:text-success"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </>
            )}
            {(suggestion.status === "pending" || suggestion.status === "accepted") && (
              <Button size="sm" onClick={handlePost} isLoading={loading} className="gap-1.5">
                <Twitter className="h-3.5 w-3.5" />
                Post
              </Button>
            )}
            {suggestion.status === "posted" && suggestion.tweetId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://twitter.com/i/status/${suggestion.tweetId}`,
                    "_blank"
                  )
                }
                className="gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
