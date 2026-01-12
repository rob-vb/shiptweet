import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "embossed" | "interactive";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  const variants = {
    default: "bg-card border border-border",
    embossed: cn(
      "bg-card",
      "shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.03),0_1px_3px_0_hsl(0_0%_0%/0.3),0_4px_12px_0_hsl(0_0%_0%/0.2)]"
    ),
    interactive: cn(
      "bg-card border border-border",
      "transition-all duration-200",
      "hover:border-accent/30 hover:bg-card-elevated",
      "hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.3)]"
    ),
  };

  return (
    <div
      className={cn(
        "rounded-sm text-card-foreground",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-5 pt-0 border-t border-border/50 mt-4", className)}
      {...props}
    />
  );
}
