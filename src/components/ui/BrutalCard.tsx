import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BrutalCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: ReactNode;
}

export function BrutalCard({
  interactive = false,
  className,
  children,
  ...props
}: BrutalCardProps) {
  return (
    <div
      className={cn(
        "bg-surface text-ink",
        interactive ? "brutal-interactive" : "brutal-border brutal-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
