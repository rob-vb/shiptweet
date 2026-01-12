import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "accent" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-accent/15 text-accent border-accent/30",
    secondary: "bg-secondary/15 text-secondary border-secondary/30",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    destructive: "bg-destructive/15 text-destructive border-destructive/30",
    accent: "bg-accent/15 text-accent border-accent/30",
    muted: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
