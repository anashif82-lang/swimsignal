"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 end-4 z-[100] flex max-h-screen w-full max-w-sm flex-col-reverse gap-2 p-4 sm:bottom-4 sm:end-4",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: null,
  success: <CheckCircle className="h-4 w-4 text-success-400" />,
  error:   <AlertCircle className="h-4 w-4 text-danger-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning-400" />,
  info:    <Info className="h-4 w-4 text-signal-400" />,
};

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastVariant;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant = "default", ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg p-4",
      "card-surface shadow-raised",
      "border-s-2",
      {
        "border-s-navy-500": variant === "default",
        "border-s-success-500": variant === "success",
        "border-s-danger-500": variant === "error",
        "border-s-warning-500": variant === "warning",
        "border-s-signal-400": variant === "info",
      },
      "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
      "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
      "data-[state=open]:animate-fade-in data-[state=closed]:opacity-0",
      className
    )}
    {...props}
  >
    {variantIcons[variant] && (
      <span className="shrink-0 mt-0.5">{variantIcons[variant]}</span>
    )}
    <div className="flex-1 grid gap-1">{props.children}</div>
    <ToastPrimitive.Close className="shrink-0 rounded p-1 text-navy-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
      <X className="h-3.5 w-3.5" />
    </ToastPrimitive.Close>
  </ToastPrimitive.Root>
));
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold text-white", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-sm text-navy-300", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

type ToastActionElement = React.ReactElement<typeof ToastPrimitive.Action>;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastProvider as Provider,
  type ToastActionElement,
  type ToastVariant,
};
