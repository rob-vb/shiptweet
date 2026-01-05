# ShipTweet - Product Requirements Document

**Build in Public, Effortlessly**

---

## Executive Summary

ShipTweet is an audience growth tool specifically designed for indie hackers and solopreneurs who want to build in public on X (Twitter). The core USP is GitHub integration: users connect their repositories, and AI automatically analyzes recent commits to generate engaging tweet suggestions about what they've built.

While tools like SuperX focus on general X growth with analytics, scheduling, and content inspiration, ShipTweet solves a specific pain point: turning actual development work into shareable content without the mental overhead of context-switching from coding to content creation.

---

## Problem Statement

Indie hackers and solopreneurs know that building in public drives audience growth, early adopters, and accountability. However:

- **Context switching is painful** — After hours of coding, the last thing developers want to do is craft tweets about their work
- **Commit messages aren't tweet-worthy** — "fixed bug in auth flow" doesn't translate to engaging content
- **Consistency is hard** — Shipping daily is one thing; tweeting about it daily is another
- **Imposter syndrome kicks in** — Developers often undervalue their progress and don't know what's "worth" sharing

**The result:** Indie hackers ship features but stay invisible, missing out on the compound benefits of building in public.

---

## Target Audience

**Primary:** Indie hackers and solopreneurs actively building software products

**Characteristics:**
- Building SaaS, apps, or developer tools
- Have public or private GitHub repositories
- Active on X (or want to be)
- Understand the value of building in public but struggle with execution
- Tech-savvy but time-constrained

**Secondary:** Small dev teams (2-5 people) who want to showcase their collective progress

---

## Unique Value Proposition

> "Ship code. We'll write the tweet."

ShipTweet transforms your GitHub commits into engaging build-in-public content. Connect a repo, and AI turns your latest commits into tweet suggestions that match your voice—no more staring at a blank compose box after a coding session.

---

## Competitive Analysis

| Feature | SuperX | Typefully | ShipTweet (Ours) |
|---------|--------|-----------|------------------|
| Tweet scheduling | ✅ | ✅ | ✅ (v2) |
| AI writing assistance | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ❌ (MVP) |
| GitHub integration | ❌ | ❌ | ✅ **Core feature** |
| Commit-to-tweet AI | ❌ | ❌ | ✅ **Core feature** |
| Build-in-public focus | Partial | Partial | ✅ **100% focused** |
| Inspiration library | ✅ | ✅ | ✅ (build-in-public specific) |
| Price point | $29-39/mo | $12-29/mo | $9-19/mo |

**Key differentiator:** No competitor converts actual development work (commits) into content. We own this niche.

---

## MVP Features

### 1. GitHub Integration (Core)

**Connect Repository**
- OAuth flow with GitHub
- Select specific repositories to track
- Support for both public and private repos
- Webhook setup for real-time commit detection

**Commit Scanning**
- Fetch commits from selected branches (default: main/master)
- Pull commit messages, file changes, and diffs
- Group related commits (same feature/fix)
- User-selectable date range picker for flexible commit scanning
- AI analyzes file changes/diffs when commit messages are vague (e.g., "wip", "fix bug")
- All commits shown, ranked by "tweetability" score (user decides what to post)

### 2. AI Tweet Generation (Core)

**Commit Analysis**
- Parse commit messages for intent (feature, fix, refactor, docs)
- **Deep file analysis:** When commit messages are unhelpful ("wip", "fix", "update"), AI analyzes actual file changes and diffs to understand what was built
- Detect patterns (new feature, bug fix, performance improvement, UI change)
- Calculate "tweetability" score based on scope, impact, and audience interest
- Flag high-value commits while showing all commits for user review

**Tweet Suggestions**
- Generate 3-5 tweet variations per significant commit/group
- Multiple tones: casual, professional, excited, technical
- Include relevant hooks and CTAs
- Suggest accompanying media (screenshot prompts, code snippets)
- Character count awareness (280 limit)

**Tweet Types Generated:**
- "Just shipped" announcements
- Progress updates ("Day X of building...")
- Technical deep-dives (thread starters)
- Milestone celebrations
- Problem/solution narratives

### 3. Voice & Style Customization

**Profile Setup**
- Product/project description
- Target audience description
- Preferred tone (casual/professional/playful)
- Example tweets user likes (for style matching)

**Learning System**
- Track which suggestions user accepts/edits/rejects
- Improve suggestions based on feedback
- Adapt to user's writing patterns over time

### 4. Dashboard & Workflow

**Main Dashboard**
- Connected repositories list
- Date range picker for commit scanning
- Recent commits with tweetability score indicators (high/medium/low)
- Generated tweet suggestions per commit
- Quick actions: copy, edit, post draft

**Tweet Queue**
- Saved suggestions awaiting review
- Edit inline before posting
- Mark as posted/dismissed

**Simple Posting**
- Copy to clipboard (one-click)
- Direct post to X (OAuth integration)
- Schedule for later (basic time picker)

---

## User Stories

1. **As an indie hacker**, I want to connect my GitHub repo so that my coding work automatically becomes content fodder

2. **As a solopreneur**, I want AI to turn my commits into tweet suggestions so I don't have to context-switch from coding to content creation

3. **As a builder**, I want multiple tweet variations so I can pick the tone that matches my mood that day

4. **As a developer**, I want the AI to understand technical changes so the tweets are accurate, not just generic

5. **As a busy founder**, I want one-click posting so I can share updates in seconds

6. **As a consistent builder**, I want to see my commit history with tweets so I never miss sharing something worth talking about

---

## Technical Architecture (MVP)

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Styling:** TailwindCSS
- **State:** React Query for server state
- **Auth:** NextAuth.js (GitHub + X OAuth)

### Backend
- **API:** Next.js API routes / Server Actions
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Queue:** Inngest or Trigger.dev for background jobs
- **AI:** OpenAI GPT-4 / Claude API

### Integrations
- **GitHub:** OAuth App + Webhooks
- **X (Twitter):** OAuth 2.0 for posting

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase
- **Monitoring:** Vercel Analytics + Sentry

---

## Data Model (Core Entities)

```
User
├── id
├── email
├── github_id
├── twitter_id
├── voice_settings (JSON)
└── created_at

Repository
├── id
├── user_id
├── github_repo_id
├── name
├── default_branch
├── is_active
└── webhook_id

Commit
├── id
├── repository_id
├── sha
├── message
├── author
├── files_changed (JSON)
├── committed_at
└── processed_at

TweetSuggestion
├── id
├── commit_id (nullable, can be grouped)
├── user_id
├── content
├── tone
├── status (pending/accepted/rejected/posted)
├── posted_at
└── created_at
```

---

## MVP Scope & Timeline

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (Next.js, Tailwind, Supabase)
- [ ] GitHub OAuth integration
- [ ] Repository selection UI
- [ ] Basic commit fetching

### Phase 2: AI Core (Week 3-4)
- [ ] Commit analysis pipeline
- [ ] AI prompt engineering for tweet generation
- [ ] Tweet suggestion UI
- [ ] Voice/style settings

### Phase 3: Publishing (Week 5-6)
- [ ] X (Twitter) OAuth integration
- [ ] Copy to clipboard functionality
- [ ] Direct posting to X
- [ ] Basic scheduling

### Phase 4: Polish & Launch (Week 7-8)
- [ ] Dashboard polish
- [ ] Onboarding flow
- [ ] Landing page
- [ ] Launch on Product Hunt

---

## Pricing Strategy (MVP)

### Free Tier
- 1 repository
- 10 AI suggestions per month
- Copy to clipboard only

### Pro ($9/month)
- 3 repositories
- 100 AI suggestions per month
- Direct posting to X
- Basic scheduling

### Builder ($19/month)
- Unlimited repositories
- Unlimited AI suggestions
- Priority AI processing
- Advanced scheduling
- Voice customization

---

## Success Metrics

1. **Activation:** % of signups who connect at least 1 repo
2. **Engagement:** AI suggestions accepted/posted per user per week
3. **Retention:** Weekly active users (WAU)
4. **Conversion:** Free to paid conversion rate
5. **NPS:** Would users recommend to fellow indie hackers?

**MVP Targets (First 3 months):**
- 500 signups
- 30% activation rate
- 50 paying customers
- 10% week-1 retention

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI generates inaccurate tweets | High | Human review required; feedback loop for improvement |
| GitHub API rate limits | Medium | Caching; webhook-first approach vs. polling |
| X API access/costs | Medium | Start with copy-to-clipboard; direct posting as upgrade |
| Low commit frequency users | Medium | Support manual progress updates; weekly digest mode |
| Privacy concerns (private repos) | High | Clear data handling policy; option to exclude sensitive files |

---

## Future Roadmap (Post-MVP)

**V2 Features:**
- Thread generation for major releases
- Analytics (which tweets perform best)
- Auto-scheduling based on optimal times
- Changelog generation
- Integration with other platforms (LinkedIn, Bluesky)

**V3 Features:**
- Team workspaces
- Multi-repo project grouping
- Audience insights
- A/B testing for tweet variations
- Browser extension for quick posting

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| Git providers | GitHub only for MVP |
| Commit filtering | Show all commits, AI ranks by "tweetability" score, user decides what to post |
| Time selection | User-selectable date range picker |
| Poor commit messages | AI analyzes file changes/diffs to generate meaningful summaries when commit messages are vague |

---

## Appendix: SuperX Feature Reference

Key features from SuperX that informed this PRD:

- **AI Chat Mode:** Personalized writing assistant that learns user's tone
- **Inspiration Engine:** Trending content discovery in user's niche
- **Algorithm Simulator:** Predict engagement before posting
- **Advanced Scheduler:** Auto-retweet, auto-plug, auto-delete
- **Analytics Dashboard:** Performance tracking and insights
- **Chrome Extension:** In-feed analytics overlay

**What we're NOT building (MVP):**
- Chrome extension
- Deep analytics
- Algorithm simulation
- Inspiration library (generic)
- Auto-retweet/plug functionality

**What we ARE building differently:**
- GitHub as primary content source (unique)
- Developer-first UX
- Build-in-public specific templates
- Code-aware AI processing
