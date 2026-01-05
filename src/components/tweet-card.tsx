"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { calculateCharCount, isValidTweetLength } from "@/lib/utils";
import { generateTwitterShareUrl } from "@/lib/twitter";
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
  Send,
  Edit2,
  ExternalLink,
  Trash2,
  Twitter,
} from "lucide-react";
import type { TweetSuggestion } from "@/lib/db";

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
        // If direct posting fails, open Twitter intent
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

  const toneColors: Record<string, string> = {
    casual: "bg-blue-100 text-blue-800",
    professional: "bg-purple-100 text-purple-800",
    excited: "bg-orange-100 text-orange-800",
    technical: "bg-green-100 text-green-800",
  };

  const statusColors: Record<string, "default" | "success" | "warning" | "destructive"> = {
    pending: "default",
    accepted: "success",
    posted: "success",
    rejected: "destructive",
    scheduled: "warning",
  };

  if (suggestion.status === "rejected") {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={toneColors[suggestion.tone] || toneColors.casual}>
            {suggestion.tone}
          </Badge>
          {suggestion.tweetType && (
            <Badge variant="secondary">{suggestion.tweetType}</Badge>
          )}
        </div>
        <Badge variant={statusColors[suggestion.status]}>
          {suggestion.status}
        </Badge>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-sm ${isValid ? "text-muted-foreground" : "text-red-500"}`}
            >
              {charCount}/280
            </span>
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
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {suggestion.content}
        </p>
      )}

      {!isEditing && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(generateTwitterShareUrl(suggestion.content), "_blank")
              }
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1">
            {suggestion.status === "pending" && (
              <>
                <Button variant="ghost" size="sm" onClick={handleReject}>
                  <X className="h-4 w-4 text-red-500" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleAccept}>
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
              </>
            )}
            {(suggestion.status === "pending" || suggestion.status === "accepted") && (
              <Button size="sm" onClick={handlePost} isLoading={loading}>
                <Twitter className="h-4 w-4 mr-1" />
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
              >
                View Tweet
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
