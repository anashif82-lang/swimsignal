import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "signal" | "success" | "warning" | "danger" | "muted" | "navy";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        `badge-${variant}`,
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeVariant };
