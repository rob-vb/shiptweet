"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getGitHubRepositories,
  connectGitHubRepository,
  getConnectedRepositories,
  disconnectGitHubRepository,
} from "@/app/actions/repositories";
import { formatRelativeTime } from "@/lib/utils";
import {
  GitBranch,
  Search,
  Plus,
  Check,
  Lock,
  Globe,
  RefreshCw,
  X,
} from "lucide-react";
import type { GitHubRepo } from "@/lib/github";
import type { Repository } from "@/lib/db";

interface RepositorySelectorProps {
  onRepositoryConnected?: (repoId: string) => void;
}

export function RepositorySelector({ onRepositoryConnected }: RepositorySelectorProps) {
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const [githubResult, connected] = await Promise.all([
        getGitHubRepositories(),
        getConnectedRepositories(),
      ]);

      if (githubResult.success && githubResult.repositories) {
        setGithubRepos(githubResult.repositories);
      }
      setConnectedRepos(connected);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleConnect = async (repo: GitHubRepo) => {
    setConnecting(repo.id);
    try {
      const result = await connectGitHubRepository(repo);
      if (result.success && result.repositoryId) {
        await fetchRepos();
        onRepositoryConnected?.(result.repositoryId);
      }
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (repoId: string) => {
    await disconnectGitHubRepository(repoId);
    await fetchRepos();
  };

  const connectedIds = new Set(connectedRepos.map((r) => r.githubRepoId));

  const filteredRepos = githubRepos.filter((repo) =>
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Connected Repositories */}
      {connectedRepos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Connected Repositories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {connectedRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{repo.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {repo.lastSyncedAt
                          ? `Last synced ${formatRelativeTime(repo.lastSyncedAt)}`
                          : "Not synced yet"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {repo.isPrivate && (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(repo.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Repositories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your GitHub Repositories</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchRepos} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading repositories...</p>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No repositories match your search"
                : "No repositories found"}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredRepos.map((repo) => {
                const isConnected = connectedIds.has(repo.id);

                return (
                  <div
                    key={repo.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isConnected ? "bg-muted/50" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GitBranch className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{repo.full_name}</p>
                        {repo.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {repo.private ? (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          )}
                          {repo.pushed_at && (
                            <span className="text-xs text-muted-foreground">
                              Updated {formatRelativeTime(repo.pushed_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={isConnected ? "secondary" : "outline"}
                      size="sm"
                      disabled={isConnected || connecting === repo.id}
                      onClick={() => handleConnect(repo)}
                      className="flex-shrink-0"
                    >
                      {connecting === repo.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : isConnected ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
