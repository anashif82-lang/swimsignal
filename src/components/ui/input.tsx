"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, startIcon, endIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-navy-100"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
              {startIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "input-dark",
              startIcon && "ps-10",
              endIcon   && "pe-10",
              error && "border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgb(239_68_68_/_0.1)]",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {endIcon && (
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-navy-400">
              {endIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-danger-400 flex items-center gap-1">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-navy-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
