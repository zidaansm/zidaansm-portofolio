"use client";

import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Profile } from "@/types/portfolio";

export function Footer({ profile }: { profile: Profile }) {
  const { locale, t } = useLanguage();
  const availability =
    locale === "id"
      ? profile.availability_status_id
      : profile.availability_status_en;

  return (
    <footer className="border-t-2 border-borderline bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 px-4 py-7 sm:px-6 sm:py-8 md:flex-row md:items-center lg:px-8">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs font-bold uppercase tracking-wider text-ink">
            <span className="inline-block h-2 w-2 shrink-0 bg-ink" />
            <span>{profile.full_name}</span>
            <span className="text-muted">— {availability}</span>
          </div>
          <p className="font-mono text-xs leading-relaxed text-muted">
            © {new Date().getFullYear()} {profile.full_name}. {t.footer.builtWith}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 font-mono text-xs font-semibold uppercase tracking-wider">
          <a
            href={profile.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
          >
            GitHub
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
          >
            LinkedIn
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <Link
            href="/cv"
            className="text-muted transition-colors hover:text-ink"
          >
            {t.footer.cvLink}
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
          >
            <Lock className="h-3 w-3" />
            {t.footer.adminLink}
          </Link>
        </div>
      </div>
    </footer>
  );
}
