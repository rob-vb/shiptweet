import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-accent/15 text-accent border-accent/30",
        secondary: "bg-secondary/15 text-secondary border-secondary/30",
        success: "bg-success/15 text-success border-success/30",
        warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        destructive: "bg-destructive/15 text-destructive border-destructive/30",
        accent: "bg-accent/15 text-accent border-accent/30",
        muted: "bg-muted text-muted-foreground border-border",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
