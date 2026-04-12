"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "signal" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:pointer-events-none disabled:opacity-50 select-none",
          {
            // Default – navy filled
            "bg-navy-700 text-white hover:bg-navy-600 border border-navy-600 hover:border-navy-500 shadow-sm":
              variant === "default",
            // Signal – cyan accent
            "bg-signal-400 text-navy-950 hover:bg-signal-300 shadow-sm font-semibold":
              variant === "signal",
            // Outline
            "border border-surface-border bg-transparent text-navy-200 hover:bg-surface-raised hover:text-white":
              variant === "outline",
            // Ghost
            "bg-transparent text-navy-200 hover:bg-surface-raised hover:text-white":
              variant === "ghost",
            // Destructive
            "bg-danger-500 text-white hover:bg-danger-400":
              variant === "destructive",
            // Link
            "text-signal-400 underline-offset-4 hover:underline p-0 h-auto":
              variant === "link",
            // Press feedback for all non-link variants
            "active:scale-[0.97] active:opacity-90":
              variant !== "link",
          },
          {
            "h-8 px-3 text-xs gap-1.5": size === "sm",
            "h-10 px-4 text-sm":        size === "md",
            "h-11 px-6 text-base":      size === "lg",
            "h-10 w-10 p-0":            size === "icon",
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";
export { Button };
