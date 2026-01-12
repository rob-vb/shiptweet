import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Github,
  ArrowRight,
  GitCommit,
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-brand-500" />
              <span className="text-xl font-bold">Commeet</span>
            </div>
            <Link href="/auth/signin">
              <Button>
                <Github className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Build in Public,{" "}
            <span className="text-brand-500">Effortlessly</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Turn your GitHub commits into engaging tweets. Connect your repos,
            and let AI write your build-in-public updates while you focus on
            shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="text-lg px-8">
                <Github className="mr-2 h-5 w-5" />
                Sign in with GitHub
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free tier available. No credit card required.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white border-y py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GitCommit className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Connect Your Repo</h3>
              <p className="text-muted-foreground">
                Link your GitHub repositories with one click. We support both
                public and private repos.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Generates Tweets</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your commits and creates engaging tweet
                suggestions that match your voice.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Review & Post</h3>
              <p className="text-muted-foreground">
                Pick your favorite, edit if needed, and share directly to X with
                one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for Indie Hackers
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Smart Commit Analysis",
                description:
                  "AI understands your code changes, even when commit messages say 'wip' or 'fix bug'.",
              },
              {
                title: "Multiple Tones",
                description:
                  "Get suggestions in casual, professional, excited, or technical voice.",
              },
              {
                title: "Tweetability Scoring",
                description:
                  "See which commits are worth sharing based on scope and audience interest.",
              },
              {
                title: "Voice Customization",
                description:
                  "Train the AI on your style so tweets sound authentically you.",
              },
              {
                title: "Private Repo Support",
                description:
                  "Your code stays private. We only analyze commit metadata and diffs.",
              },
              {
                title: "Direct Posting",
                description:
                  "Connect X and post directly, or copy to clipboard for manual posting.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-6 bg-white rounded-lg border"
              >
                <CheckCircle2 className="h-6 w-6 text-brand-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border-y py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                features: [
                  "1 repository",
                  "10 AI suggestions/month",
                  "Copy to clipboard",
                ],
              },
              {
                name: "Pro",
                price: "$9",
                popular: true,
                features: [
                  "3 repositories",
                  "100 AI suggestions/month",
                  "Direct posting to X",
                  "Basic scheduling",
                ],
              },
              {
                name: "Builder",
                price: "$19",
                features: [
                  "Unlimited repositories",
                  "Unlimited AI suggestions",
                  "Priority AI processing",
                  "Advanced scheduling",
                  "Voice customization",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-lg border-2 ${
                  plan.popular
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <span className="text-xs font-semibold text-brand-600 uppercase">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold mt-2">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2">
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signin" className="block mt-6">
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ship code. We'll write the tweet.
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of indie hackers who are building in public without
            the content creation overhead.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="text-lg px-8">
              <Github className="mr-2 h-5 w-5" />
              Start Building in Public
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-brand-500" />
              <span className="font-semibold">Commeet</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with love for the indie hacker community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
