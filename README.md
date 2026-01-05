# ShipTweet

**Build in Public, Effortlessly**

ShipTweet transforms your GitHub commits into engaging tweets. Connect your repos, and AI writes your build-in-public updates while you focus on shipping.

## Features

- **GitHub Integration** - Connect public and private repositories with OAuth
- **AI Tweet Generation** - Analyzes commits and generates engaging tweet suggestions
- **Smart Commit Analysis** - Understands code changes even with vague commit messages
- **Multiple Tones** - Casual, professional, excited, or technical variations
- **Tweetability Scoring** - Ranks commits by shareability
- **Direct Posting** - Post to X (Twitter) with one click
- **Voice Customization** - Train AI to match your writing style

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: NextAuth.js v5 (GitHub + Twitter OAuth)
- **AI**: Vercel AI SDK (Anthropic Claude / OpenAI)
- **State**: React Query

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- GitHub OAuth App
- Twitter/X OAuth 2.0 App
- OpenAI or Anthropic API key

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in your credentials:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
TWITTER_CLIENT_ID="..."
TWITTER_CLIENT_SECRET="..."
ANTHROPIC_API_KEY="..." # or OPENAI_API_KEY
```

### Installation

```bash
# Install dependencies
npm install

# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/     # Protected dashboard routes
│   │   ├── dashboard/   # Main dashboard
│   │   ├── repositories/# Repo management
│   │   ├── queue/       # Tweet queue
│   │   └── settings/    # User settings
│   ├── auth/            # Auth pages
│   ├── api/             # API routes
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Base UI components
│   └── ...              # Feature components
├── lib/
│   ├── db/              # Database schema & client
│   ├── ai/              # AI tweet generation
│   ├── auth.ts          # NextAuth config
│   ├── github.ts        # GitHub API client
│   └── twitter.ts       # Twitter API client
└── types/               # TypeScript types
```

## OAuth App Setup

### GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App:
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
3. Request scopes: `read:user`, `user:email`, `repo`

### Twitter/X OAuth 2.0

1. Go to Twitter Developer Portal
2. Create new project and app
3. Set up OAuth 2.0:
   - Callback URL: `http://localhost:3000/api/auth/callback/twitter`
   - Scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`

## Deployment

Deploy to Vercel:

```bash
npm run build
vercel deploy
```

Make sure to configure environment variables in Vercel dashboard.

## License

MIT
