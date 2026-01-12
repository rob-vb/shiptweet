"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
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
  LayoutDashboard,
  GitBranch,
  ListTodo,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repositories", label: "Repositories", icon: GitBranch },
  { href: "/queue", label: "Queue", icon: ListTodo },
];

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center group-hover:shadow-glow transition-shadow">
                <Zap className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight">commeet</span>
            </Link>

            {session && (
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${isActive ? "nav-item-active" : ""}`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                {/* Connection badges - desktop */}
                <div className="hidden lg:flex items-center gap-2">
                  {session.user.hasGithub && (
                    <Badge variant="secondary" className="gap-1.5">
                      <Github className="h-3 w-3" />
                      <span className="text-[10px] uppercase tracking-wider">Connected</span>
                    </Badge>
                  )}
                  {session.user.hasTwitter && (
                    <Badge className="gap-1.5">
                      <Twitter className="h-3 w-3" />
                      <span className="text-[10px] uppercase tracking-wider">Connected</span>
                    </Badge>
                  )}
                </div>

                {/* Settings */}
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>

                {/* User menu */}
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  {session.user.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={28}
                      height={28}
                      className="rounded-sm ring-1 ring-border"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile menu toggle */}
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
                <Button size="sm" className="gap-2">
                  <Github className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {session && mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/settings"
                className="nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              {/* Mobile badges */}
              <div className="flex items-center gap-2 px-3 pt-3 mt-2 border-t border-border/50">
                {session.user.hasGithub && (
                  <Badge variant="secondary" className="gap-1">
                    <Github className="h-3 w-3" />
                    GitHub
                  </Badge>
                )}
                {session.user.hasTwitter && (
                  <Badge className="gap-1">
                    <Twitter className="h-3 w-3" />
                    X
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
