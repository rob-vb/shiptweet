import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }

  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + "...";
}

export function getTweetabilityLabel(score: number | null): {
  label: string;
  className: string;
} {
  if (score === null) {
    return { label: "Unscored", className: "score-low" };
  }
  if (score >= 70) {
    return { label: "High", className: "score-high" };
  }
  if (score >= 40) {
    return { label: "Medium", className: "score-medium" };
  }
  return { label: "Low", className: "score-low" };
}

export function getCommitTypeEmoji(type: string | null): string {
  const emojis: Record<string, string> = {
    feature: "✨",
    fix: "🐛",
    refactor: "♻️",
    docs: "📚",
    chore: "🔧",
    style: "💄",
    test: "🧪",
    perf: "⚡",
  };
  return emojis[type || ""] || "📝";
}

export function calculateCharCount(text: string): number {
  // Twitter counts URLs as 23 characters regardless of actual length
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  let count = text.length;

  for (const url of urls) {
    count = count - url.length + 23;
  }

  return count;
}

export function isValidTweetLength(text: string): boolean {
  return calculateCharCount(text) <= 280;
}

export function generateTwitterShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
