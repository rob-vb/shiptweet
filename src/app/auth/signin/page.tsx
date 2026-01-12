import { signIn } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Github, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Gradient background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card variant="embossed" className="w-full">
          <CardHeader className="text-center pb-2">
            <Link href="/" className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center shadow-glow">
                <Zap className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight">commeet</span>
            </Link>
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in with GitHub to start turning your commits into tweets
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-sm py-3 px-4 font-medium hover:bg-foreground/90 transition-all active:scale-[0.98]"
              >
                <Github className="h-5 w-5" />
                Continue with GitHub
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-center text-xs text-muted-foreground">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          commit + tweet = commeet
        </p>
      </div>
    </div>
  );
}
