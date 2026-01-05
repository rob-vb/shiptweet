import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  githubId: text("github_id").unique(),
  githubAccessToken: text("github_access_token"),
  twitterId: text("twitter_id").unique(),
  twitterAccessToken: text("twitter_access_token"),
  twitterRefreshToken: text("twitter_refresh_token"),
  voiceSettings: jsonb("voice_settings").$type<VoiceSettings>(),
  plan: text("plan").notNull().default("free"), // free, pro, builder
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Repositories table
export const repositories = pgTable(
  "repositories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    githubRepoId: integer("github_repo_id").notNull(),
    name: text("name").notNull(),
    fullName: text("full_name").notNull(), // owner/repo
    description: text("description"),
    defaultBranch: text("default_branch").notNull().default("main"),
    isPrivate: boolean("is_private").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    webhookId: integer("webhook_id"),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("repositories_user_id_idx").on(table.userId),
    githubRepoIdIdx: index("repositories_github_repo_id_idx").on(table.githubRepoId),
  })
);

// Commits table
export const commits = pgTable(
  "commits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    sha: text("sha").notNull(),
    message: text("message").notNull(),
    author: text("author"),
    authorEmail: text("author_email"),
    filesChanged: jsonb("files_changed").$type<FileChange[]>(),
    additions: integer("additions").default(0),
    deletions: integer("deletions").default(0),
    tweetabilityScore: integer("tweetability_score"), // 0-100
    commitType: text("commit_type"), // feature, fix, refactor, docs, chore
    aiSummary: text("ai_summary"),
    committedAt: timestamp("committed_at").notNull(),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    repositoryIdIdx: index("commits_repository_id_idx").on(table.repositoryId),
    shaIdx: index("commits_sha_idx").on(table.sha),
    committedAtIdx: index("commits_committed_at_idx").on(table.committedAt),
  })
);

// Tweet suggestions table
export const tweetSuggestions = pgTable(
  "tweet_suggestions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    commitId: uuid("commit_id").references(() => commits.id, { onDelete: "set null" }),
    content: text("content").notNull(),
    tone: text("tone").notNull(), // casual, professional, excited, technical
    tweetType: text("tweet_type"), // shipped, progress, technical, milestone, problem_solution
    status: text("status").notNull().default("pending"), // pending, accepted, rejected, posted, scheduled
    scheduledFor: timestamp("scheduled_for"),
    postedAt: timestamp("posted_at"),
    tweetId: text("tweet_id"), // Twitter's tweet ID after posting
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("tweet_suggestions_user_id_idx").on(table.userId),
    commitIdIdx: index("tweet_suggestions_commit_id_idx").on(table.commitId),
    statusIdx: index("tweet_suggestions_status_idx").on(table.status),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  repositories: many(repositories),
  tweetSuggestions: many(tweetSuggestions),
}));

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
  user: one(users, {
    fields: [repositories.userId],
    references: [users.id],
  }),
  commits: many(commits),
}));

export const commitsRelations = relations(commits, ({ one, many }) => ({
  repository: one(repositories, {
    fields: [commits.repositoryId],
    references: [repositories.id],
  }),
  tweetSuggestions: many(tweetSuggestions),
}));

export const tweetSuggestionsRelations = relations(tweetSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [tweetSuggestions.userId],
    references: [users.id],
  }),
  commit: one(commits, {
    fields: [tweetSuggestions.commitId],
    references: [commits.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;
export type Commit = typeof commits.$inferSelect;
export type NewCommit = typeof commits.$inferInsert;
export type TweetSuggestion = typeof tweetSuggestions.$inferSelect;
export type NewTweetSuggestion = typeof tweetSuggestions.$inferInsert;

export interface VoiceSettings {
  productDescription?: string;
  targetAudience?: string;
  preferredTone?: "casual" | "professional" | "playful" | "technical";
  exampleTweets?: string[];
}

export interface FileChange {
  filename: string;
  status: "added" | "modified" | "removed" | "renamed";
  additions: number;
  deletions: number;
  patch?: string;
}
