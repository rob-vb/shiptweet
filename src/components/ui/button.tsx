"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center font-medium transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:opacity-50 disabled:pointer-events-none",
      "active:scale-[0.98]"
    );

    const variants = {
      default: cn(
        "bg-accent text-accent-foreground",
        "hover:bg-accent/90",
        "shadow-[0_0_20px_hsl(var(--accent)/0.3)]",
        "hover:shadow-[0_0_30px_hsl(var(--accent)/0.4)]"
      ),
      secondary: cn(
        "bg-card border border-border text-foreground",
        "hover:bg-card-elevated hover:border-border/80"
      ),
      outline: cn(
        "border border-border bg-transparent text-foreground",
        "hover:bg-muted hover:border-accent/50"
      ),
      ghost: cn(
        "text-muted-foreground bg-transparent",
        "hover:bg-muted hover:text-foreground"
      ),
      destructive: cn(
        "bg-destructive text-destructive-foreground",
        "hover:bg-destructive/90"
      ),
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-sm",
      md: "h-10 px-5 py-2 rounded-sm",
      lg: "h-12 px-8 text-base rounded-sm",
      icon: "h-9 w-9 rounded-sm",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
