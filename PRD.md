# Product Requirements Document (PRD)
## Commeet - Build in Public, Effortlessly

**Version:** 1.0
**Last Updated:** January 2026

---

## 1. Executive Summary

### 1.1 Product Overview
Commeet is a SaaS application that transforms GitHub commits into engaging tweets for indie hackers and solopreneurs who want to "build in public" on X (Twitter). The app analyzes commits using AI to score their "tweetability" and generates multiple tweet variations tailored to the user's voice and audience.

### 1.2 Target Users
- Indie hackers building products publicly
- Solopreneurs sharing development progress
- Developers who want to grow their Twitter/X presence
- Open source maintainers showcasing project updates

### 1.3 Core Value Proposition
- **Save time**: Automatically generate tweet content from commits
- **Stay consistent**: Never miss sharing a shipping update
- **Sound authentic**: AI learns your voice and writing style
- **Build audience**: Engage followers with your development journey

---

## 2. Features & Functionality

### 2.1 Authentication & Account Management

#### 2.1.1 GitHub OAuth (Required)
- **Purpose**: Access user's repositories and commits
- **OAuth Scopes**: `read:user`, `user:email`, `repo`
- **Data Retrieved**: User profile, repositories, commits, file changes

#### 2.1.2 Twitter/X OAuth (Optional)
- **Purpose**: Direct posting to Twitter/X
- **OAuth Scopes**: `tweet.read`, `tweet.write`, `users.read`, `offline.access`
- **Token Refresh**: Automatic refresh on 401 responses

#### 2.1.3 Session Management
- Persistent sessions with secure token storage
- Track connection status for both platforms
- Plan tier stored in session

---

### 2.2 Repository Management

#### 2.2.1 Repository Browser
- Display all user's GitHub repositories (public and private)
- Search/filter repositories by name
- Show repository metadata:
  - Public/private badge
  - Default branch name
  - Last sync timestamp

#### 2.2.2 Repository Connection
- Connect repositories to enable commit tracking
- Initial sync of recent commits on connection
- Configurable sync settings per repository

#### 2.2.3 Repository Disconnection
- Soft delete (deactivate) repository connection
- Preserve historical data for potential reconnection

---

### 2.3 Commit Processing & Analysis

#### 2.3.1 Commit Syncing
- Fetch commits from connected repositories
- Filter by date range
- Store commit metadata:
  - SHA, message, author, timestamp
  - Files changed (filename, status, additions, deletions, patch)

#### 2.3.2 AI-Powered Commit Analysis
For each commit, the AI analyzes and generates:

**Tweetability Score (0-100)**
| Score Range | Category | Example |
|-------------|----------|---------|
| 80-100 | Major Feature | New user authentication, major UI redesign |
| 60-79 | Notable | Bug fixes with user impact, performance improvements |
| 40-59 | Minor Progress | Small feature additions, refactors |
| 20-39 | Routine | Dependency updates, code cleanup |
| 0-19 | Trivial | Typo fixes, formatting changes |

**Commit Type Classification**
- `feature` - New functionality
- `fix` - Bug fixes
- `refactor` - Code restructuring
- `docs` - Documentation changes
- `chore` - Maintenance tasks
- `style` - Styling/UI changes
- `test` - Test additions/updates
- `perf` - Performance improvements

**AI Summary**
- Human-readable summary of changes
- Overrides vague commit messages (e.g., "WIP", "fix stuff")
- Highlights user-facing impact

---

### 2.4 Tweet Generation

#### 2.4.1 Single Commit Tweet Generation
Generate 4 tweet variations per commit with different tones:

| Tone | Style | Example |
|------|-------|---------|
| Casual | Friendly, conversational | "Just shipped dark mode! Been wanting to do this forever 🌙" |
| Professional | Business-like, polished | "Released dark mode support, improving accessibility and user comfort." |
| Excited | Enthusiastic, energetic | "DARK MODE IS LIVE!!! 🚀🌙 The most requested feature is finally here!" |
| Technical | Developer-focused, detailed | "Implemented dark mode using CSS custom properties and prefers-color-scheme media query." |

#### 2.4.2 Combined/Batch Tweet Generation
- Select multiple commits
- AI generates cohesive summary tweets
- Ideal for weekly/daily update roundups

#### 2.4.3 Tweet Content Rules
- Maximum 280 characters (Twitter limit)
- URLs count as 23 characters
- Include relevant hashtags
- Optional call-to-action
- Respect user's voice settings

---

### 2.5 Voice Customization

User-configurable settings that influence AI generation:

| Setting | Description | Example |
|---------|-------------|---------|
| Product Description | What you're building | "A task management app for remote teams" |
| Target Audience | Who you're speaking to | "Indie hackers, startup founders, productivity enthusiasts" |
| Preferred Tone | Default tone preference | Casual, Professional, Excited, Technical |
| Example Tweets | Sample tweets in your voice | 3-5 tweets that represent your style |

---

### 2.6 Tweet Queue Management

#### 2.6.1 Queue Tabs/Statuses
| Status | Description |
|--------|-------------|
| Pending | Newly generated, awaiting review |
| Accepted | Approved, ready to post |
| Scheduled | Set for future posting |
| Posted | Successfully published to Twitter |
| Rejected | Dismissed by user |

#### 2.6.2 Queue Actions
- **Edit**: Inline editing with live character counter
- **Accept**: Move from pending to accepted
- **Reject**: Dismiss suggestion
- **Delete**: Permanently remove
- **Copy**: Copy text to clipboard
- **Post**: Publish directly to Twitter (requires Twitter OAuth)
- **Schedule**: Set future posting time
- **View on Twitter**: Link to posted tweet

---

### 2.7 Dashboard

#### 2.7.1 Stats Overview
Display key metrics:
- Total connected repositories
- Total commits processed
- Pending tweet suggestions
- Posted tweets count

#### 2.7.2 Commit List View
For each commit, display:
- Tweetability score (visual ring/progress indicator)
- Commit message (with AI summary if available)
- File change statistics (+additions/-deletions)
- Commit type badge with emoji
- Number of tweet suggestions generated
- Expandable detail view

#### 2.7.3 Filtering & Selection
- Repository selector dropdown
- Date range picker
- Multi-select commits for batch operations
- "Select all" functionality

---

### 2.8 Scheduling (Pro/Builder tiers)

- Set specific date/time for posting
- Timezone handling
- Queue management for scheduled posts
- Automatic posting at scheduled time

---

## 3. Data Models

### 3.1 User
```
User {
  id: UUID (primary key)
  email: String
  name: String
  image: String (avatar URL)

  // OAuth Tokens
  githubAccessToken: String (encrypted)
  twitterAccessToken: String (encrypted)
  twitterRefreshToken: String (encrypted)

  // Voice Settings
  voiceTone: Enum (casual, professional, excited, technical)
  productDescription: String
  targetAudience: String
  exampleTweets: String[] (array of example tweets)

  // Account
  plan: Enum (free, pro, builder)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 3.2 Repository
```
Repository {
  id: UUID (primary key)
  userId: UUID (foreign key → User)

  githubRepoId: Integer
  name: String (e.g., "owner/repo-name")
  defaultBranch: String
  isPublic: Boolean
  isActive: Boolean

  webhookId: String (optional)
  lastSyncedAt: Timestamp

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 3.3 Commit
```
Commit {
  id: UUID (primary key)
  repositoryId: UUID (foreign key → Repository)

  sha: String (git commit hash)
  message: String
  author: String
  committedAt: Timestamp

  // File Changes (JSON)
  filesChanged: [{
    filename: String
    status: String (added, modified, deleted)
    additions: Integer
    deletions: Integer
    patch: String (diff content)
  }]

  // AI Analysis
  tweetabilityScore: Integer (0-100)
  commitType: Enum (feature, fix, refactor, docs, chore, style, test, perf)
  aiSummary: String
  isProcessed: Boolean

  createdAt: Timestamp
}
```

### 3.4 Tweet Suggestion
```
TweetSuggestion {
  id: UUID (primary key)
  commitId: UUID (foreign key → Commit, nullable for combined tweets)
  userId: UUID (foreign key → User)

  content: String (max 280 chars)
  tone: Enum (casual, professional, excited, technical)
  tweetType: Enum (shipped, progress, technical, milestone, problem_solution)
  status: Enum (pending, accepted, rejected, posted, scheduled)

  // Posting
  postedAt: Timestamp (nullable)
  twitterTweetId: String (nullable)
  scheduledFor: Timestamp (nullable)

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 4. API Endpoints / Server Actions

### 4.1 Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth.js handler |
| `/auth/signin` | GET | Sign in page |
| `/auth/signout` | POST | Sign out |

### 4.2 Repositories
| Action | Description |
|--------|-------------|
| `getGitHubRepositories()` | Fetch all repos from GitHub API |
| `getConnectedRepositories()` | Get user's connected repos from DB |
| `connectGitHubRepository(repoId)` | Connect repo and initial sync |
| `disconnectGitHubRepository(repoId)` | Deactivate repository |
| `syncRepository(repoId, since?, until?)` | Sync commits with optional date filter |
| `getRepositoryCommits(repoId)` | Get commits from database |

### 4.3 Tweets
| Action | Description |
|--------|-------------|
| `generateTweetsForCommit(commitId)` | Generate suggestions for single commit |
| `generateTweetsForCommits(commitIds[])` | Batch generate for multiple commits |
| `generateCombinedTweet(commitIds[])` | Generate summary tweet for multiple commits |
| `getTweetSuggestions(filters)` | Query suggestions by status, commit, etc. |
| `updateSuggestionStatus(id, status)` | Change suggestion status |
| `updateSuggestionContent(id, content)` | Edit tweet content |
| `postTweetSuggestion(id)` | Post to Twitter/X |
| `scheduleTweetSuggestion(id, scheduledFor)` | Schedule for later |
| `deleteSuggestion(id)` | Delete suggestion |

### 4.4 User
| Action | Description |
|--------|-------------|
| `getCurrentUser()` | Get authenticated user |
| `updateVoiceSettings(settings)` | Update voice customization |
| `getUserStats()` | Get aggregated metrics |

---

## 5. Pages & Routes

### 5.1 Public Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page (hero, features, pricing, CTA) |
| `/auth/signin` | GitHub OAuth login |
| `/auth/error` | Authentication error page |

### 5.2 Protected Routes (Require Authentication)
| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard with stats, commits, generation |
| `/repositories` | Repository browser and connection management |
| `/queue` | Tweet queue with status tabs |
| `/settings` | Voice settings and account management |

---

## 6. Pricing Model

| Feature | Free | Pro ($9/mo) | Builder ($19/mo) |
|---------|------|-------------|------------------|
| Connected Repositories | 1 | 3 | Unlimited |
| Tweet Suggestions/month | 10 | 100 | Unlimited |
| Copy to Clipboard | ✓ | ✓ | ✓ |
| Direct Posting to X | ✗ | ✓ | ✓ |
| Basic Scheduling | ✗ | ✓ | ✓ |
| Advanced Scheduling | ✗ | ✗ | ✓ |
| Voice Customization | ✗ | ✗ | ✓ |
| Priority Processing | ✗ | ✗ | ✓ |

---

## 7. External Integrations

### 7.1 GitHub API
- **Authentication**: OAuth 2.0
- **Endpoints Used**:
  - `GET /user` - User profile
  - `GET /user/repos` - List repositories
  - `GET /repos/{owner}/{repo}/commits` - List commits
  - `GET /repos/{owner}/{repo}/commits/{sha}` - Commit details with file changes
- **Rate Limits**: 5,000 requests/hour for authenticated users

### 7.2 Twitter/X API v2
- **Authentication**: OAuth 2.0 with PKCE
- **Endpoints Used**:
  - `POST /2/tweets` - Create tweet
  - `GET /2/users/me` - User profile
- **Rate Limits**: Varies by endpoint and access level

### 7.3 AI Providers
- **Primary**: Anthropic Claude (claude-3-sonnet or similar)
- **Fallback**: OpenAI GPT-4o
- **Usage**:
  - Commit analysis (500 tokens)
  - Tweet generation (1000 tokens per batch)

---

## 8. UI/UX Specifications

### 8.1 Design System
- **Color Palette**:
  - Primary: Blue (#3B82F6)
  - Accent: Purple (#8B5CF6)
  - Success: Emerald (#10B981)
  - Warning: Amber (#F59E0B)
  - Error: Red (#EF4444)

- **Typography**:
  - Sans-serif system font stack
  - Monospace for code/commits

### 8.2 Component Patterns

#### Cards
- Consistent border radius (8px)
- Subtle shadow on hover
- White background with border

#### Badges
- Tone badges: Blue variants
- Type badges: Purple variants
- Status badges: Color-coded by status

#### Score Display
- Circular progress ring (SVG)
- Color gradient based on score
- Numeric value in center

#### Lists
- Expandable items (click to reveal details)
- Checkbox selection for multi-select
- Hover states for interactivity

### 8.3 Responsive Design
- Mobile-first approach
- Collapsible navigation on mobile
- Responsive grid layouts
- Touch-friendly tap targets

---

## 9. Security Requirements

### 9.1 Authentication
- OAuth tokens stored encrypted in database
- Server-side only token access (no client exposure)
- Secure session management

### 9.2 Data Access
- All queries scoped to authenticated user
- No cross-user data access
- Repository access verified via GitHub API

### 9.3 Input Validation
- Tweet length validation (280 char max)
- Sanitize user inputs
- Rate limiting on generation endpoints

---

## 10. Technical Architecture

### 10.1 Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Dashboard │ │  Repos   │ │  Queue   │ │Settings  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (API Layer)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Auth   │ │  Repos   │ │  Tweets  │ │   User   │       │
│  │ Actions  │ │ Actions  │ │ Actions  │ │ Actions  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Database   │    │   GitHub     │    │    AI        │
│  (PostgreSQL)│    │    API       │    │  Provider    │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                    ┌──────────┴──────────┐
                                    ▼                     ▼
                              ┌──────────┐         ┌──────────┐
                              │ Anthropic│         │  OpenAI  │
                              │  Claude  │         │  GPT-4o  │
                              └──────────┘         └──────────┘
```

### 10.2 Data Flow

1. **User connects GitHub** → OAuth → Store tokens → Fetch repos
2. **User connects repository** → Store repo → Sync commits → Analyze commits
3. **User generates tweets** → Send to AI → Store suggestions → Display in queue
4. **User posts tweet** → Validate → Post to Twitter → Update status

---

## 11. Key Algorithms

### 11.1 Tweetability Scoring

```
function calculateTweetabilityScore(commit):
  score = 0

  // File changes impact
  if hasNewFiles: score += 20
  if hasUIChanges: score += 15
  if hasAPIChanges: score += 15

  // Commit message analysis
  if containsKeywords(['add', 'new', 'feature', 'launch', 'ship']): score += 20
  if containsKeywords(['fix', 'resolve', 'solve']): score += 10
  if isVagueMessage(['wip', 'stuff', 'misc']): score -= 20

  // Change magnitude
  linesChanged = additions + deletions
  if linesChanged > 200: score += 20
  else if linesChanged > 50: score += 10
  else if linesChanged < 10: score -= 10

  return clamp(score, 0, 100)
```

### 11.2 Character Counting

```
function countTweetCharacters(text):
  // Twitter counts URLs as 23 characters
  urlRegex = /(https?:\/\/[^\s]+)/g
  urls = text.match(urlRegex) || []

  // Remove URLs and count remaining
  textWithoutUrls = text.replace(urlRegex, '')
  charCount = textWithoutUrls.length

  // Add 23 for each URL
  charCount += urls.length * 23

  return charCount
```

---

## 12. Environment Variables

```
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# GitHub OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Twitter/X OAuth
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...

# AI Providers (at least one required)
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

---

## 13. Success Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| User Activation | Users who connect a repo within 24h | 60% |
| Tweet Generation | Avg tweets generated per user/week | 10+ |
| Post Rate | % of generated tweets actually posted | 30% |
| Retention | Monthly active users returning | 40% |
| Conversion | Free → Paid conversion | 5% |

---

## 14. Future Considerations

- **Webhook Integration**: Real-time commit processing via GitHub webhooks
- **Multi-platform**: Support for LinkedIn, Threads, Bluesky
- **Analytics**: Tweet performance tracking and insights
- **Team Features**: Shared repositories and collaborative queues
- **Custom Prompts**: User-defined AI prompt templates
- **API Access**: Public API for power users
- **Browser Extension**: Quick tweet generation from GitHub

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Tweetability Score | AI-calculated metric (0-100) indicating how interesting a commit is for social sharing |
| Voice Settings | User preferences that customize AI-generated content to match their writing style |
| Build in Public | The practice of sharing development progress publicly to build an audience |
| Indie Hacker | Independent developer building and monetizing their own products |

---

## Appendix B: User Stories

1. **As a developer**, I want to connect my GitHub repositories so that my commits are tracked automatically.

2. **As an indie hacker**, I want AI to generate tweets from my commits so that I save time on content creation.

3. **As a content creator**, I want to customize my voice settings so that generated tweets sound like me.

4. **As a busy founder**, I want to schedule tweets for optimal posting times so that I can batch my social media work.

5. **As a quality-conscious user**, I want to review and edit suggestions before posting so that I maintain my brand voice.

6. **As a power user**, I want to select multiple commits and generate a summary tweet so that I can share weekly progress updates.
