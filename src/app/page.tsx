import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Github,
  ArrowRight,
  GitCommit,
  Sparkles,
  Send,
  Check,
  Zap,
  ChevronRight,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
                <Zap className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">commeet</span>
            </div>
            <Link href="/auth/signin">
              <Button size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent border border-accent/20 rounded-sm">
                For Indie Hackers
              </span>
              <span className="text-muted-foreground text-sm">
                Building in public made effortless
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-display-sm md:text-display lg:text-display-lg font-bold tracking-tight mb-6">
              Ship code.{" "}
              <span className="text-accent">We write the tweet.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              Connect your GitHub repos. Our AI transforms your commits into
              engaging tweets that sound like you—not a robot.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signin">
                <Button size="lg" className="gap-2 text-base px-8 shadow-glow">
                  <Github className="h-5 w-5" />
                  Connect GitHub
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground self-center">
                Free tier available · No credit card
              </span>
            </div>
          </div>

          {/* Hero visual - Tweet preview */}
          <div className="mt-20 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-secondary/10 to-transparent blur-3xl opacity-30" />
            <div className="relative tweet-card p-6 max-w-xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div>
                  <div className="font-medium">@yourhandle</div>
                  <div className="text-sm text-muted-foreground">just now</div>
                </div>
              </div>
              <p className="text-lg leading-relaxed mb-4">
                Just shipped dark mode for the dashboard 🌙 Users can now toggle
                between light and dark themes. Small detail, big impact on
                late-night coding sessions.{" "}
                <span className="text-accent">#buildinpublic</span>
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                    247/280
                  </span>
                </span>
                <span className="badge-accent text-xs">casual</span>
                <span className="tweet-type-shipped text-xs px-2 py-0.5 rounded">
                  shipped
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                How it works
              </h2>
              <p className="text-muted-foreground">
                Three steps to consistent content
              </p>
            </div>
            <div className="hidden md:block text-sm text-muted-foreground font-mono">
              01 → 02 → 03
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: GitCommit,
                title: "Connect repos",
                description:
                  "Link your GitHub with one click. Public or private—we only read commit metadata and diffs.",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "AI generates tweets",
                description:
                  "Our AI analyzes what you actually built, even when commits say 'wip' or 'fix stuff'.",
              },
              {
                step: "03",
                icon: Send,
                title: "Review & post",
                description:
                  "Pick your favorite variation, edit if needed, share directly to X with one click.",
              },
            ].map((item) => (
              <div key={item.step} className="group">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold text-muted-foreground/30 group-hover:text-accent/30 transition-colors">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 bg-card border border-border rounded-sm flex items-center justify-center group-hover:border-accent/50 transition-colors">
                    <item.icon className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Built for developers who ship
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Not another generic AI tool. Commeet understands code and
                creates content that resonates with the builder community.
              </p>

              <div className="space-y-4">
                {[
                  "Smart commit analysis—understands your code, not just messages",
                  "Four tone variations: casual, professional, excited, technical",
                  "Tweetability scoring highlights your best work",
                  "Voice customization so tweets sound like you",
                  "Private repos supported—your code stays private",
                  "Direct posting to X or copy to clipboard",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-sm bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-accent" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Feature cards */}
              <div className="card-embossed p-6 rounded-md hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold">Multi-commit summaries</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Select multiple commits and generate one cohesive update.
                  Perfect for weekly roundups or feature releases.
                </p>
              </div>

              <div className="card-embossed p-6 rounded-md hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-sm flex items-center justify-center">
                    <GitCommit className="h-5 w-5 text-secondary" />
                  </div>
                  <h3 className="font-semibold">Deep code understanding</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  AI reads actual diffs, not just commit messages. Understands
                  what you built even when you wrote "misc fixes".
                </p>
              </div>

              <div className="card-embossed p-6 rounded-md hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-success/10 rounded-sm flex items-center justify-center">
                    <Zap className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="font-semibold">Tweetability scoring</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Not every commit deserves a tweet. Scoring helps you focus on
                  updates your audience will actually care about.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Simple pricing
            </h2>
            <p className="text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                description: "For trying it out",
                features: [
                  "1 repository",
                  "10 AI suggestions/month",
                  "Copy to clipboard",
                ],
              },
              {
                name: "Pro",
                price: "$9",
                description: "For consistent builders",
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
                description: "For power users",
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
                className={`relative p-6 rounded-md border ${
                  plan.popular
                    ? "border-accent bg-accent/5 shadow-glow"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6">
                    <span className="px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-sm">
                      Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signin" className="block">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    Get started
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to build in public?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Join developers who turn their GitHub activity into engaging content
            without the overhead.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="gap-2 text-base px-8 shadow-glow">
              <Github className="h-5 w-5" />
              Start with GitHub
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-accent rounded-sm flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-semibold">commeet</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for developers who ship · commit + tweet = commeet
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
