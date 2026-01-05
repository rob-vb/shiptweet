import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { db } from "@/lib/db";
import { commits, tweetSuggestions, users, type VoiceSettings, type Commit } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const TWEET_TONES = ["casual", "professional", "excited", "technical"] as const;
type TweetTone = (typeof TWEET_TONES)[number];

const TWEET_TYPES = [
  "shipped",
  "progress",
  "technical",
  "milestone",
  "problem_solution",
] as const;
type TweetType = (typeof TWEET_TYPES)[number];

interface TweetSuggestion {
  content: string;
  tone: TweetTone;
  tweetType: TweetType;
}

function getModel() {
  // Prefer Anthropic if available, fallback to OpenAI
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-sonnet-4-20250514");
  }
  return openai("gpt-4o");
}

export async function analyzeCommit(commit: Commit): Promise<{
  tweetabilityScore: number;
  commitType: string;
  aiSummary: string;
}> {
  const model = getModel();

  const filesContext =
    commit.filesChanged && commit.filesChanged.length > 0
      ? `\nFiles changed:\n${commit.filesChanged
          .map(
            (f) =>
              `- ${f.filename} (${f.status}): +${f.additions}/-${f.deletions}${
                f.patch ? `\nPatch preview: ${f.patch.slice(0, 500)}` : ""
              }`
          )
          .join("\n")}`
      : "";

  const prompt = `Analyze this git commit for a "build in public" tweet:

Commit message: ${commit.message}
Lines added: ${commit.additions || 0}
Lines deleted: ${commit.deletions || 0}${filesContext}

Respond with JSON only, no other text:
{
  "tweetabilityScore": <number 0-100, how interesting this would be to share publicly>,
  "commitType": "<one of: feature, fix, refactor, docs, chore, style, test, perf>",
  "aiSummary": "<one sentence human-readable summary of what was actually built/changed, even if commit message is vague like 'wip' or 'fix'>"
}

Scoring guide:
- 80-100: Major new feature, significant UI change, or milestone
- 60-79: Notable improvement, interesting bug fix, or good learning
- 40-59: Minor but tangible progress
- 20-39: Small changes, routine maintenance
- 0-19: Trivial commits (typos, formatting, config)`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 500,
    });

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      tweetabilityScore: Math.min(100, Math.max(0, result.tweetabilityScore)),
      commitType: result.commitType || "chore",
      aiSummary: result.aiSummary || commit.message,
    };
  } catch (error) {
    console.error("Error analyzing commit:", error);
    return {
      tweetabilityScore: 30,
      commitType: "chore",
      aiSummary: commit.message.split("\n")[0],
    };
  }
}

export async function generateTweetSuggestions(
  commit: Commit,
  voiceSettings?: VoiceSettings | null
): Promise<TweetSuggestion[]> {
  const model = getModel();

  const voiceContext = voiceSettings
    ? `
Voice/Style preferences:
- Product: ${voiceSettings.productDescription || "A software product"}
- Target audience: ${voiceSettings.targetAudience || "Developers and indie hackers"}
- Preferred tone: ${voiceSettings.preferredTone || "casual"}
${
  voiceSettings.exampleTweets?.length
    ? `- Example tweets they like:\n${voiceSettings.exampleTweets.map((t) => `  "${t}"`).join("\n")}`
    : ""
}`
    : "";

  const filesContext =
    commit.filesChanged && commit.filesChanged.length > 0
      ? `\nKey files changed: ${commit.filesChanged
          .slice(0, 5)
          .map((f) => f.filename)
          .join(", ")}`
      : "";

  const prompt = `Generate 4 tweet variations for this "build in public" update:

Commit: ${commit.message}
AI Summary: ${commit.aiSummary || commit.message}
Type: ${commit.commitType || "feature"}
Lines changed: +${commit.additions || 0}/-${commit.deletions || 0}${filesContext}
${voiceContext}

Generate 4 tweets (one each: casual, professional, excited, technical).
Each tweet must be under 280 characters and feel authentic, not AI-generated.
Include relevant hashtags sparingly (0-2 max).

Respond with JSON array only:
[
  {"content": "tweet text", "tone": "casual", "tweetType": "shipped"},
  {"content": "tweet text", "tone": "professional", "tweetType": "shipped"},
  {"content": "tweet text", "tone": "excited", "tweetType": "progress"},
  {"content": "tweet text", "tone": "technical", "tweetType": "technical"}
]

Tweet types to use: shipped, progress, technical, milestone, problem_solution

Guidelines:
- Start with hooks like "Just shipped...", "Finally cracked...", "Day X update:", etc.
- Be specific about what was built, not generic
- Sound human, not corporate
- Casual can use lowercase and abbreviations
- Technical can include brief code concepts
- Each must be unique and interesting`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 1000,
    });

    // Parse JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }

    const suggestions: TweetSuggestion[] = JSON.parse(jsonMatch[0]);

    // Validate and clean suggestions
    return suggestions
      .filter((s) => s.content && s.content.length <= 280)
      .map((s) => ({
        content: s.content.trim(),
        tone: TWEET_TONES.includes(s.tone as TweetTone) ? (s.tone as TweetTone) : "casual",
        tweetType: TWEET_TYPES.includes(s.tweetType as TweetType)
          ? (s.tweetType as TweetType)
          : "shipped",
      }));
  } catch (error) {
    console.error("Error generating tweets:", error);
    // Return a basic suggestion as fallback
    return [
      {
        content: `Just shipped: ${commit.aiSummary || commit.message.slice(0, 200)} #buildinpublic`,
        tone: "casual",
        tweetType: "shipped",
      },
    ];
  }
}

export async function processCommit(
  commitId: string,
  userId: string
): Promise<{ analyzed: boolean; suggestionsCreated: number }> {
  const commit = await db.query.commits.findFirst({
    where: eq(commits.id, commitId),
  });

  if (!commit) {
    throw new Error("Commit not found");
  }

  // Analyze commit if not already done
  if (!commit.processedAt) {
    const analysis = await analyzeCommit(commit);

    await db
      .update(commits)
      .set({
        tweetabilityScore: analysis.tweetabilityScore,
        commitType: analysis.commitType,
        aiSummary: analysis.aiSummary,
        processedAt: new Date(),
      })
      .where(eq(commits.id, commitId));

    // Update commit object with analysis
    commit.tweetabilityScore = analysis.tweetabilityScore;
    commit.commitType = analysis.commitType;
    commit.aiSummary = analysis.aiSummary;
  }

  // Get user voice settings
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  // Generate tweet suggestions
  const suggestions = await generateTweetSuggestions(commit, user?.voiceSettings);

  // Save suggestions to database
  if (suggestions.length > 0) {
    await db.insert(tweetSuggestions).values(
      suggestions.map((s) => ({
        userId,
        commitId,
        content: s.content,
        tone: s.tone,
        tweetType: s.tweetType,
        status: "pending",
      }))
    );
  }

  return {
    analyzed: true,
    suggestionsCreated: suggestions.length,
  };
}

export async function processMultipleCommits(
  commitIds: string[],
  userId: string
): Promise<{ processed: number; totalSuggestions: number }> {
  let processed = 0;
  let totalSuggestions = 0;

  for (const commitId of commitIds) {
    try {
      const result = await processCommit(commitId, userId);
      if (result.analyzed) processed++;
      totalSuggestions += result.suggestionsCreated;
    } catch (error) {
      console.error(`Error processing commit ${commitId}:`, error);
    }
  }

  return { processed, totalSuggestions };
}
