"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portfolio runtime error:", error);
  }, [error]);

  return (
    <main className="swiss-grid-bg flex min-h-screen items-center justify-center bg-canvas px-4 py-16 text-ink">
      <div className="w-full max-w-xl border-2 border-borderline bg-surface p-6 shadow-brutal sm:p-10">
        <div className="mb-6 flex items-center justify-between border-b-2 border-borderline pb-3 font-mono text-xs font-bold uppercase tracking-widest">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>RUNTIME // ERROR</span>
          </span>
          {error.digest && (
            <span className="truncate text-muted">ID: {error.digest}</span>
          )}
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Something went wrong on this page.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          A temporary hiccup occurred while rendering this view. You can retry
          loading the section or return safely to the portfolio homepage.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="brutal-interactive inline-flex min-h-[44px] items-center justify-center gap-2 bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-canvas"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="brutal-interactive inline-flex min-h-[44px] items-center justify-center gap-2 bg-surface px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portfolio</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
