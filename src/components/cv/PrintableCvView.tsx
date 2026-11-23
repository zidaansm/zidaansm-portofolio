"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { BrutalButton } from "@/components/ui/BrutalButton";
import type { PortfolioData } from "@/types/portfolio";

export function PrintableCvView({ data }: { data: PortfolioData }) {
  const { locale, t } = useLanguage();
  const { profile, projects, capabilities, experiences } = data;

  const role = locale === "id" ? profile.role_id : profile.role_en;
  const bio = locale === "id" ? profile.bio_id : profile.bio_en;

  return (
    <div className="min-h-screen bg-canvas py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Top Action Bar (Hidden in Print) */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 border-2 border-borderline bg-surface p-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.cv.backHome}</span>
          </Link>

          <div className="flex items-center gap-3">
            <BrutalButton type="button" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              <span>{t.cv.printPdf}</span>
            </BrutalButton>
          </div>
        </div>

        <p className="no-print mb-4 font-mono text-xs text-muted">{t.cv.note}</p>

        {/* Printable CV Sheet */}
        <article className="print-container border-2 border-borderline bg-surface p-8 sm:p-10 shadow-brutal">
          <header className="border-b-2 border-borderline pb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              {profile.full_name}
            </h1>
            <p className="mt-1 font-mono text-sm font-semibold uppercase tracking-wider text-muted">
              {role}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-ink">
              <span>{profile.location}</span>
              <span>•</span>
              <span>{profile.email}</span>
              <span>•</span>
              <span>{profile.github_url}</span>
              <span>•</span>
              <span>{profile.linkedin_url}</span>
            </div>
          </header>

          {/* Summary */}
          <section className="mt-6">
            <h2 className="mb-2 border-b border-borderline pb-1 font-mono text-xs font-bold uppercase tracking-widest text-ink">
              {t.cv.summaryTitle}
            </h2>
            <p className="text-sm leading-relaxed text-ink/90">{bio}</p>
          </section>

          {/* Technical Skills */}
          <section className="mt-6">
            <h2 className="mb-3 border-b border-borderline pb-1 font-mono text-xs font-bold uppercase tracking-widest text-ink">
              {t.cv.skillsTitle}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {capabilities.map((cap) => (
                <div key={cap.id} className="text-sm">
                  <span className="font-bold text-ink">
                    {locale === "id" ? cap.title_id : cap.title_en}:{" "}
                  </span>
                  <span className="text-muted">{cap.items.join(", ")}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Selected Projects */}
          <section className="mt-6">
            <h2 className="mb-3 border-b border-borderline pb-1 font-mono text-xs font-bold uppercase tracking-widest text-ink">
              {t.cv.projectsTitle}
            </h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-ink">
                      {locale === "id" ? project.title_id : project.title_en}
                    </h3>
                    <span className="font-mono text-xs text-muted">
                      {project.year}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink/90">
                    {locale === "id" ? project.summary_id : project.summary_en}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    Stack: {project.tech_stack.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Experience & Education */}
          {experiences.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 border-b border-borderline pb-1 font-mono text-xs font-bold uppercase tracking-widest text-ink">
                {t.cv.experienceTitle}
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-ink">
                        {exp.organization} —{" "}
                        {locale === "id" ? exp.role_id : exp.role_en}
                      </h3>
                      <span className="font-mono text-xs text-muted">
                        {exp.period}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink/90">
                      {locale === "id" ? exp.summary_id : exp.summary_en}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
