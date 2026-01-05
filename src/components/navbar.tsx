"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Settings,
  LogOut,
  Github,
  Twitter,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-brand-500" />
              <span className="text-xl font-bold">ShipTweet</span>
            </Link>

            {session && (
              <div className="hidden md:flex items-center ml-8 gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/repositories"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Repositories
                </Link>
                <Link
                  href="/queue"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tweet Queue
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  {session.user.hasGithub && (
                    <Badge variant="success" className="gap-1">
                      <Github className="h-3 w-3" />
                      GitHub
                    </Badge>
                  )}
                  {session.user.hasTwitter && (
                    <Badge variant="success" className="gap-1">
                      <Twitter className="h-3 w-3" />
                      Twitter
                    </Badge>
                  )}
                </div>

                <Link href="/settings">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>

                <div className="flex items-center gap-3">
                  {session.user.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button>
                  <Github className="mr-2 h-4 w-4" />
                  Sign in with GitHub
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {session && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/repositories"
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Repositories
              </Link>
              <Link
                href="/queue"
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tweet Queue
              </Link>
              <Link
                href="/settings"
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
