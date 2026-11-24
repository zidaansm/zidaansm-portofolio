"use client";

import { ArrowUpRight, FolderGit2, GitFork, Star } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Badge } from "@/components/ui/Badge";
import { BrutalLinkButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { GitHubShowcaseData } from "@/types/portfolio";

const levelClasses: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-canvas border border-borderline/20",
  1: "bg-ink/20 border border-borderline/30",
  2: "bg-ink/45 border border-borderline/45",
  3: "bg-ink/75 border border-borderline/70",
  4: "bg-ink border border-borderline",
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
  const { t } = useLanguage();

  if (!data || data.repos.length === 0) {
    return null;
  }

  return (
    <section
      id="github"
      className="scroll-mt-20 border-b-2 border-borderline bg-surface/40 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          number={t.github.sectionNumber}
          label={t.github.sectionLabel}
          title={t.github.title}
          subtitle={t.github.subtitle}
        />

        {/* Monochrome GitHub Summary Bar */}
        <BrutalCard className="mb-8 p-5 sm:p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t.github.handleLabel}
              </p>
              <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 font-display text-xl font-bold text-ink hover:underline"
              >
                <span>@{data.username}</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t.github.reposLabel}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {data.publicRepos}
              </p>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t.github.starsLabel}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {data.totalStars}
              </p>
            </div>

            <div>
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
          <BrutalCard className="mb-8 p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-borderline pb-3">
              <h3 className="font-display text-base font-bold text-ink sm:text-lg">
                {t.github.contributionsTitle}
              </h3>
              <Badge variant="solid">
                {data.contributions.totalContributions.toLocaleString()}{" "}
                {t.github.totalContributions}
              </Badge>
            </div>

            {(() => {
              const monthLabels = getMonthLabels(data.contributions.weeks);
              return (
                <div className="overflow-x-auto pb-2">
                  <div className="inline-flex flex-col gap-1.5">
                    {/* Month Labels Row */}
                    <div className="flex gap-1">
                      {monthLabels.map((label, idx) => (
                        <div
                          key={idx}
                          className="w-3 shrink-0 font-mono text-[9px] font-bold uppercase text-muted"
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
                              className={`h-3 w-3 shrink-0 ${levelClasses[day.level]}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
              <span>{t.github.less}</span>
              {([0, 1, 2, 3, 4] as const).map((lvl) => (
                <span
                  key={lvl}
                  className={`inline-block h-3 w-3 ${levelClasses[lvl]}`}
                />
              ))}
              <span>{t.github.more}</span>
            </div>
          </BrutalCard>
        )}

        {/* Repository Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.repos.map((repo) => (
            <BrutalCard
              key={repo.id}
              interactive
              className="flex h-full flex-col justify-between p-5"
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2 border-b-2 border-borderline pb-2.5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink truncate">
                    <FolderGit2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{repo.name}</span>
                  </span>
                  {repo.language && (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {repo.language}
                    </Badge>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-muted">
                  {repo.description || t.github.noDescription}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-borderline/20 pt-3 font-mono text-xs">
                <div className="flex items-center gap-3 text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {repo.stars}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5" />
                    {repo.forks}
                  </span>
                  {repo.pushedAt && (
                    <span className="text-[11px]">{repo.pushedAt}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {repo.homepage && (
                    <a
                      href={
                        repo.homepage.startsWith("http")
                          ? repo.homepage
                          : `https://${repo.homepage}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-borderline bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase text-canvas"
                    >
                      {t.github.liveBadge}
                    </a>
                  )}
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${repo.name} ${t.github.viewRepo}`}
                    className="inline-flex items-center gap-0.5 font-bold uppercase text-ink hover:underline"
                  >
                    <span>Code</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </BrutalCard>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <BrutalLinkButton href={data.profileUrl} external variant="secondary" size="md">
            <span>{t.github.viewProfile}</span>
            <ArrowUpRight className="h-4 w-4" />
          </BrutalLinkButton>
        </div>
      </div>
    </section>
  );
}
