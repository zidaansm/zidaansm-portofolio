"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, FolderGit2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Badge } from "@/components/ui/Badge";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Project } from "@/types/portfolio";

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const { locale, t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filterOptions = useMemo(() => {
    const categories = Array.from(new Set(projects.map((p) => p.category)));
    const keyStacks = Array.from(
      new Set(projects.flatMap((p) => p.tech_stack))
    ).slice(0, 6);

    return {
      categories,
      keyStacks,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "ALL") return projects;
    return projects.filter(
      (project) =>
        project.category === activeFilter ||
        project.tech_stack.includes(activeFilter)
    );
  }, [projects, activeFilter]);

  return (
    <section id="projects" className="scroll-mt-20 border-b-2 border-borderline py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          number={t.projects.sectionNumber}
          label={t.projects.sectionLabel}
          title={t.projects.title}
          subtitle={t.projects.subtitle}
        />

        {/* Filter Bar */}
        <div
          role="group"
          aria-label="Filter projects by category or technology"
          className="mb-8 flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={`border-2 border-borderline px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeFilter === "ALL"
                ? "bg-ink text-canvas shadow-brutal-sm"
                : "bg-surface text-ink hover:bg-ink/5"
            }`}
          >
            {t.projects.filterAll} ({projects.length})
          </button>

          {filterOptions.categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveFilter(category)}
              className={`border-2 border-borderline px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                activeFilter === category
                  ? "bg-ink text-canvas shadow-brutal-sm"
                  : "bg-surface text-ink hover:bg-ink/5"
              }`}
            >
              {category}
            </button>
          ))}

          {filterOptions.keyStacks.map((stack) => (
            <button
              key={stack}
              type="button"
              onClick={() => setActiveFilter(stack)}
              className={`border border-borderline px-2.5 py-1.5 font-mono text-xs font-medium uppercase tracking-wider transition-all ${
                activeFilter === stack
                  ? "bg-ink text-canvas"
                  : "bg-canvas text-muted hover:text-ink"
              }`}
            >
              {stack}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <BrutalCard className="p-8 text-center font-mono text-sm text-muted">
            {t.projects.emptyState}
          </BrutalCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const title =
                  locale === "id" ? project.title_id : project.title_en;
                const summary =
                  locale === "id" ? project.summary_id : project.summary_en;
                const role = locale === "id" ? project.role_id : project.role_en;
                const impact =
                  locale === "id" ? project.impact_id : project.impact_en;

                return (
                  <motion.article
                    key={project.id}
                    layout={!prefersReducedMotion}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.22 }}
                  >
                    <BrutalCard
                      interactive
                      className="group flex h-full flex-col justify-between p-6 sm:p-7"
                    >
                      <div>
                        {/* Card Metadata Row */}
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-borderline pb-3">
                          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                            <span className="bg-ink px-2 py-0.5 text-canvas">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="text-muted">{project.category}</span>
                          </div>
                          <Badge variant="outline">{project.year}</Badge>
                        </div>

                        {/* Project Thumbnail Frame */}
                        <Link
                          href={`/projects/${project.slug}`}
                          className="mb-5 block overflow-hidden border-2 border-borderline bg-canvas"
                        >
                          {project.cover_image_url ? (
                            <div className="relative aspect-[16/9] w-full overflow-hidden">
                              <img
                                src={project.cover_image_url}
                                alt={title}
                                className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:scale-[1.03] group-hover:grayscale-0"
                              />
                            </div>
                          ) : (
                            <div className="swiss-grid-bg flex aspect-[16/9] w-full flex-col justify-between p-4 transition-colors group-hover:bg-ink/[0.03]">
                              <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
                                <span>CASE // {String(index + 1).padStart(2, "0")}</span>
                                <span>{project.year}</span>
                              </div>
                              <div className="font-display text-2xl font-bold tracking-tight text-ink/85 sm:text-3xl">
                                {project.slug.replace(/-/g, " ").toUpperCase()}
                              </div>
                              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                                {project.tech_stack.slice(0, 4).join(" · ")}
                              </div>
                            </div>
                          )}
                        </Link>

                        {/* Title & Role */}
                        <h3 className="font-display text-2xl font-bold leading-snug tracking-tight text-ink">
                          <Link
                            href={`/projects/${project.slug}`}
                            className="hover:underline underline-offset-4"
                          >
                            {title}
                          </Link>
                        </h3>
                        <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-muted">
                          {t.projects.roleLabel}: {role}
                        </p>

                        {/* Summary */}
                        <p className="mt-4 text-sm leading-relaxed text-ink/90 sm:text-base">
                          {summary}
                        </p>

                        {/* Impact Callout */}
                        <div className="mt-4 border-l-2 border-borderline pl-3">
                          <p className="text-xs leading-relaxed text-muted">
                            {impact}
                          </p>
                        </div>

                        {/* Tech Stack Pills */}
                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {project.tech_stack.map((tech) => (
                            <span
                              key={tech}
                              className="border border-borderline bg-canvas px-2 py-0.5 font-mono text-[11px] font-medium text-ink"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-borderline pt-4">
                        <Link
                          href={`/projects/${project.slug}`}
                          className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink underline-offset-4 hover:underline"
                        >
                          <span>{t.projects.readCaseStudy}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                        <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-wider">
                          {project.repo_url && (
                            <a
                              href={project.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-muted hover:text-ink"
                            >
                              <FolderGit2 className="h-3.5 w-3.5" />
                              <span>{t.projects.repository}</span>
                            </a>
                          )}
                          {project.live_url && (
                            <a
                              href={project.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-ink hover:underline"
                            >
                              <span>{t.projects.liveDemo}</span>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </BrutalCard>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
