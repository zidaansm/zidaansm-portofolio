import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "solid" | "outline";
  className?: string;
}

export function Badge({ children, variant = "outline", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border border-borderline px-2.5 py-1 font-mono text-xs font-medium uppercase tracking-wider",
        variant === "solid"
          ? "bg-ink text-canvas"
          : "bg-surface text-ink",
        className
      )}
    >
      {children}
    </span>
  );
}
