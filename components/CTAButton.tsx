import React from "react";
import { cn } from "@/lib/utils";

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
}

export const CTAButton = React.forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          // Base sizes
          "h-12 px-8 py-4 text-sm md:text-base",
          // Variants
          variant === "primary" &&
            "bg-amber-500 text-zinc-950 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25",
          variant === "secondary" &&
            "bg-zinc-800 text-amber-500 hover:bg-zinc-700 hover:shadow-lg hover:shadow-black/50",
          variant === "outline" &&
            "border border-amber-500/50 bg-transparent text-amber-500 hover:border-amber-500 hover:bg-amber-500/10",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CTAButton.displayName = "CTAButton";
