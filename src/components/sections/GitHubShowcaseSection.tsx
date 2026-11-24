"use client";

import { ArrowUpRight, FolderGit2, GitFork, Star } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Badge } from "@/components/ui/Badge";
import { BrutalLinkButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { GitHubShowcaseData } from "@/types/portfolio";

const levelClasses: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800",
  1: "bg-zinc-300 border border-zinc-400 dark:bg-zinc-700 dark:border-zinc-600",
  2: "bg-zinc-500 border border-zinc-600 dark:bg-zinc-500 dark:border-zinc-400",
  3: "bg-zinc-700 border border-zinc-800 dark:bg-zinc-300 dark:border-zinc-200",
  4: "bg-zinc-950 border border-zinc-950 dark:bg-white dark:border-white",
};

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getMonthLabels(weeks: { days: { date: string }[] }[]): (string | null)[] {
  let lastMonth = -1;
  return weeks.map((week) => {
    const firstDate = week.days[0]?.date;
    if (!firstDate) return null;
    const monthIndex = Number(firstDate.slice(5, 7)) - 1;
    if (Number.isNaN(monthIndex) || monthIndex === lastMonth) {
      return null;
    }
    lastMonth = monthIndex;
    return MONTH_SHORT[monthIndex] ?? null;
  });
}

export function GitHubShowcaseSection({
  data,
}: {
  data: GitHubShowcaseData | null;
}) {
  const { locale, t } = useLanguage();

  if (!data || data.repos.length === 0) {
    return null;
  }

  return (
    <section
      id="github"
      className="scroll-mt-16 border-b-2 border-borderline bg-surface/40 py-12 sm:scroll-mt-20 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          number={t.github.sectionNumber}
          label={t.github.sectionLabel}
          title={t.github.title}
          subtitle={t.github.subtitle}
        />

        {/* Monochrome GitHub Summary Bar */}
        <BrutalCard className="mb-6 w-full min-w-0 max-w-full p-4 sm:mb-8 sm:p-6">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            <div className="col-span-2 min-w-0 border-b border-borderline/20 pb-3 sm:col-span-1 sm:border-b-0 sm:pb-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t.github.handleLabel}
              </p>
              <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex max-w-full items-center gap-1.5 font-display text-lg font-bold text-ink hover:underline sm:text-xl"
              >
                <span className="truncate">@{data.username}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </a>
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t.github.reposLabel}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {data.publicRepos}
              </p>
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t.github.starsLabel}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {data.totalStars}
              </p>
            </div>

            <div className="col-span-2 min-w-0 border-t border-borderline/20 pt-3 sm:col-span-1 sm:border-t-0 sm:pt-0">
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                {t.github.languagesLabel}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.topLanguages.map((lang) => (
                  <span
                    key={lang.name}
                    className="border border-borderline bg-canvas px-2 py-0.5 font-mono text-[11px] font-semibold text-ink"
                  >
                    {lang.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </BrutalCard>

        {/* Monochrome GitHub Contribution Calendar (requires GITHUB_TOKEN) */}
        {data.contributions && data.contributions.weeks.length > 0 && (
          <BrutalCard className="mb-6 w-full min-w-0 max-w-full p-4 sm:mb-8 sm:p-6">
            <div className="mb-4 flex flex-col items-start justify-between gap-2 border-b-2 border-borderline pb-3 sm:flex-row sm:items-center">
              <h3 className="font-display text-base font-bold text-ink sm:text-lg">
                {t.github.contributionsTitle}
              </h3>
              <Badge variant="solid" className="text-[11px] sm:text-xs">
                {data.contributions.totalContributions.toLocaleString()}{" "}
                {t.github.totalContributions}
              </Badge>
            </div>

            {(() => {
              const monthLabels = getMonthLabels(data.contributions.weeks);
              return (
                <div className="w-full max-w-full overflow-x-auto pb-2">
                  <div className="inline-flex flex-col gap-1.5">
                    {/* Month Labels Row */}
                    <div className="flex gap-1">
                      {monthLabels.map((label, idx) => (
                        <div
                          key={idx}
                          className="w-2.5 shrink-0 font-mono text-[9px] font-bold uppercase text-muted sm:w-3"
                        >
                          {label ?? ""}
                        </div>
                      ))}
                    </div>

                    {/* Weekly Columns Grid */}
                    <div className="flex gap-1">
                      {data.contributions.weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1">
                          {week.days.map((day) => (
                            <div
                              key={day.date}
                              title={`${day.date}: ${day.count} ${t.github.contributionUnit}`}
                              className={`h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3 ${levelClasses[day.level]}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
              <span className="md:hidden">
                {locale === "id" ? "← Geser kalender →" : "← Swipe calendar →"}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <span>{t.github.less}</span>
                {([0, 1, 2, 3, 4] as const).map((lvl) => (
                  <span
                    key={lvl}
                    className={`inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 ${levelClasses[lvl]}`}
                  />
                ))}
                <span>{t.github.more}</span>
              </div>
            </div>
          </BrutalCard>
        )}

        {/* Featured 3 Repositories Grid (strictly mobile-safe min-w-0) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {data.repos.slice(0, 3).map((repo) => (
            <BrutalCard
              key={repo.id}
              interactive
              className="flex h-full w-full min-w-0 max-w-full flex-col justify-between p-4 sm:p-5"
            >
              <div className="min-w-0">
                <div className="mb-3 flex min-w-0 items-center justify-between gap-2 border-b-2 border-borderline pb-2.5">
                  <span className="flex min-w-0 flex-1 items-center gap-1.5 font-mono text-xs font-bold text-ink">
                    <FolderGit2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{repo.name}</span>
                  </span>
                  {repo.language && (
                    <Badge variant="outline" className="shrink-0 px-2 py-0.5 text-[10px]">
                      {repo.language}
                    </Badge>
                  )}
                </div>

                <p className="break-words text-sm leading-relaxed text-muted line-clamp-3">
                  {repo.description || t.github.noDescription}
                </p>
              </div>

              <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-borderline/20 pt-3 font-mono text-xs sm:mt-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 shrink-0" />
                    {repo.stars}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5 shrink-0" />
                    {repo.forks}
                  </span>
                  {repo.pushedAt && (
                    <span className="text-[11px]">{repo.pushedAt}</span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {repo.homepage && (
                    <a
                      href={
                        repo.homepage.startsWith("http")
                          ? repo.homepage
                          : `https://${repo.homepage}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-borderline bg-ink px-2 py-1 text-[10px] font-bold uppercase text-canvas"
                    >
                      {t.github.liveBadge}
                    </a>
                  )}
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${repo.name} ${t.github.viewRepo}`}
                    className="inline-flex items-center gap-0.5 py-1 font-bold uppercase text-ink hover:underline"
                  >
                    <span>Code</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            </BrutalCard>
          ))}
        </div>

        <div className="mt-6 flex justify-end sm:mt-8">
          <BrutalLinkButton
            href={data.profileUrl}
            external
            variant="secondary"
            size="md"
            className="w-full sm:w-auto"
          >
            <span>{t.github.viewProfile}</span>
            <ArrowUpRight className="h-4 w-4" />
          </BrutalLinkButton>
        </div>
      </div>
    </section>
  );
}
