"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateVoiceSettings } from "@/app/actions/user";
import { Github, Twitter, Check, Settings, Mic2, Save } from "lucide-react";
import type { User, VoiceSettings } from "@/lib/db/schema";

interface SettingsClientProps {
  user: User;
  hasGithub: boolean;
  hasTwitter: boolean;
  connectTwitterAction: () => Promise<void>;
}

export function SettingsClient({
  user,
  hasGithub,
  hasTwitter,
  connectTwitterAction,
}: SettingsClientProps) {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(
    user.voiceSettings || {}
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveVoice = async () => {
    setSaving(true);
    try {
      await updateVoiceSettings(voiceSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const tones = [
    { value: "casual", label: "Casual", description: "Relaxed, friendly, conversational" },
    { value: "professional", label: "Professional", description: "Polished, business-appropriate" },
    { value: "playful", label: "Playful", description: "Fun, energetic, uses humor" },
    { value: "technical", label: "Technical", description: "Detailed, precise, developer-focused" },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your connections and customize your tweet voice.
        </p>
      </div>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Manage your GitHub and X (Twitter) connections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GitHub */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <Github className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">GitHub</p>
                <p className="text-sm text-muted-foreground">
                  {hasGithub ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            {hasGithub ? (
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Button variant="outline" disabled>
                Required
              </Button>
            )}
          </div>

          {/* Twitter */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
                <Twitter className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">X (Twitter)</p>
                <p className="text-sm text-muted-foreground">
                  {hasTwitter
                    ? "Connected - Direct posting enabled"
                    : "Connect to post directly to X"}
                </p>
              </div>
            </div>
            {hasTwitter ? (
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <form action={connectTwitterAction}>
                <Button type="submit" variant="outline">
                  <Twitter className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic2 className="h-5 w-5" />
            Voice & Style
          </CardTitle>
          <CardDescription>
            Customize how the AI generates tweets to match your unique voice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              What are you building?
            </label>
            <Textarea
              placeholder="e.g., A SaaS tool that helps indie hackers track their revenue metrics..."
              value={voiceSettings.productDescription || ""}
              onChange={(e) =>
                setVoiceSettings({ ...voiceSettings, productDescription: e.target.value })
              }
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Describe your product or project so AI can reference it in tweets.
            </p>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Audience</label>
            <Input
              placeholder="e.g., Indie hackers, startup founders, solopreneurs"
              value={voiceSettings.targetAudience || ""}
              onChange={(e) =>
                setVoiceSettings({ ...voiceSettings, targetAudience: e.target.value })
              }
            />
          </div>

          {/* Preferred Tone */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Tone</label>
            <div className="grid grid-cols-2 gap-3">
              {tones.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() =>
                    setVoiceSettings({ ...voiceSettings, preferredTone: tone.value })
                  }
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    voiceSettings.preferredTone === tone.value
                      ? "border-brand-500 bg-brand-50"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="font-medium">{tone.label}</p>
                  <p className="text-xs text-muted-foreground">{tone.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Example Tweets */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Example Tweets You Like (Optional)
            </label>
            <Textarea
              placeholder="Paste tweets that match your desired style, one per line..."
              value={voiceSettings.exampleTweets?.join("\n") || ""}
              onChange={(e) =>
                setVoiceSettings({
                  ...voiceSettings,
                  exampleTweets: e.target.value.split("\n").filter(Boolean),
                })
              }
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              The AI will learn from these examples to match your style.
            </p>
          </div>

          <Button onClick={handleSaveVoice} disabled={saving} className="w-full">
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Voice Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">{user.plan} Plan</p>
              <p className="text-sm text-muted-foreground">
                {user.plan === "free"
                  ? "1 repo, 10 AI suggestions/month"
                  : user.plan === "pro"
                  ? "3 repos, 100 AI suggestions/month"
                  : "Unlimited repos & suggestions"}
              </p>
            </div>
            {user.plan === "free" && (
              <Button variant="outline">
                Upgrade to Pro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
