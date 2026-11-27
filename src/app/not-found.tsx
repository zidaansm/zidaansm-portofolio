import Link from "next/link";
import { ArrowLeft, FileText, FolderKanban } from "lucide-react";

export default function NotFound() {
  return (
    <main className="swiss-grid-bg flex min-h-screen items-center justify-center bg-canvas px-4 py-16 text-ink">
      <div className="w-full max-w-xl border-2 border-borderline bg-surface p-6 shadow-brutal sm:p-10">
        <div className="mb-6 flex items-center justify-between border-b-2 border-borderline pb-3 font-mono text-xs font-bold uppercase tracking-widest">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center border-2 border-borderline bg-ink text-canvas">
              Z
            </span>
            <span>ERROR // 404</span>
          </span>
          <span className="text-muted">ROUTE NOT FOUND</span>
        </div>

        <p className="font-display text-6xl font-bold leading-none tracking-tight sm:text-7xl">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          The URL may have moved, been unpublished, or typed incorrectly. Head
          back to the portfolio homepage or jump straight to Zidan&apos;s
          projects and CV below.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/"
            className="brutal-interactive inline-flex min-h-[44px] items-center justify-center gap-2 bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-canvas"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portfolio</span>
          </Link>

          <Link
            href="/#projects"
            className="brutal-interactive inline-flex min-h-[44px] items-center justify-center gap-2 bg-surface px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink"
          >
            <FolderKanban className="h-4 w-4" />
            <span>View Projects</span>
          </Link>

          <Link
            href="/cv"
            className="brutal-interactive inline-flex min-h-[44px] items-center justify-center gap-2 bg-canvas px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink"
          >
            <FileText className="h-4 w-4" />
            <span>Open CV</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
