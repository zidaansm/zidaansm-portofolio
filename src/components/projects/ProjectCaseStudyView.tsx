"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FolderGit2,
  Maximize2,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Badge } from "@/components/ui/Badge";
import { BrutalLinkButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import type { Project } from "@/types/portfolio";

interface ProjectCaseStudyViewProps {
  project: Project;
  prevProject: Project | null;
  nextProject: Project | null;
}

export function ProjectCaseStudyView({
  project,
  prevProject,
  nextProject,
}: ProjectCaseStudyViewProps) {
  const { locale, t } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const title = locale === "id" ? project.title_id : project.title_en;
  const summary = locale === "id" ? project.summary_id : project.summary_en;
  const role = locale === "id" ? project.role_id : project.role_en;
  const problem = locale === "id" ? project.problem_id : project.problem_en;
  const architecture =
    locale === "id" ? project.architecture_id : project.architecture_en;
  const challenges =
    locale === "id" ? project.challenges_id : project.challenges_en;
  const impact = locale === "id" ? project.impact_id : project.impact_en;
  const gallery = Array.isArray(project.gallery_images)
    ? project.gallery_images
    : [];

  useEffect(() => {
    if (lightboxIndex === null || gallery.length === 0) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % gallery.length
        );
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + gallery.length) % gallery.length
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, gallery.length]);

  const sections = [
    { title: t.caseStudy.problemTitle, body: problem },
    { title: t.caseStudy.architectureTitle, body: architecture },
    { title: t.caseStudy.challengesTitle, body: challenges },
    { title: t.caseStudy.impactTitle, body: impact },
  ];

  const activePhoto =
    lightboxIndex !== null && gallery[lightboxIndex]
      ? gallery[lightboxIndex]
      : null;

  return (
    <main className="py-8 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/#projects"
          className="mb-6 inline-flex min-h-[40px] items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-ink sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.caseStudy.backToProjects}</span>
        </Link>

        {/* Header */}
        <div className="border-b-2 border-borderline pb-6 sm:pb-8">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 sm:mb-4">
            <Badge variant="solid">{t.caseStudy.overview}</Badge>
            <Badge variant="outline">{project.category}</Badge>
            <Badge variant="outline">{project.year}</Badge>
          </div>

          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4 sm:text-lg">
            {summary}
          </p>

          {(project.live_url || project.repo_url) && (
            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap">
              {project.live_url && (
                <BrutalLinkButton
                  href={project.live_url}
                  external
                  size="md"
                  className="w-full sm:w-auto"
                >
                  <span>{t.caseStudy.liveDemo}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </BrutalLinkButton>
              )}
              {project.repo_url && (
                <BrutalLinkButton
                  href={project.repo_url}
                  external
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  <FolderGit2 className="h-4 w-4" />
                  <span>{t.caseStudy.viewRepo}</span>
                </BrutalLinkButton>
              )}
            </div>
          )}
        </div>

        {/* Cover Thumbnail Showcase */}
        {project.cover_image_url && (
          <div className="my-6 overflow-hidden border-2 border-borderline bg-surface shadow-brutal sm:my-8">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={project.cover_image_url}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <BrutalCard className="my-6 p-4 sm:my-8 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t.caseStudy.metaRole}
              </p>
              <p className="mt-1 font-sans text-sm font-semibold text-ink">
                {role}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t.caseStudy.metaYear}
              </p>
              <p className="mt-1 font-sans text-sm font-semibold text-ink">
                {project.year}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t.caseStudy.metaCategory}
              </p>
              <p className="mt-1 font-sans text-sm font-semibold text-ink">
                {project.category}
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-borderline/20 pt-4 sm:mt-6 sm:pt-5">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">
              {t.caseStudy.metaStack}
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {project.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="border border-borderline bg-canvas px-2 py-1 font-mono text-[11px] font-semibold text-ink sm:px-2.5 sm:text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </BrutalCard>

        {/* Engineering Storytelling Sections */}
        <div className="space-y-5 sm:space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="border-2 border-borderline bg-surface p-4 sm:p-8"
            >
              <h2 className="mb-3 border-b-2 border-borderline pb-2.5 font-display text-lg font-bold text-ink sm:mb-4 sm:pb-3 sm:text-2xl">
                {section.title}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/90 sm:text-base">
                {section.body}
              </p>
            </section>
          ))}

          {/* Documentation & Screenshots Gallery */}
          {gallery.length > 0 && (
            <section className="border-2 border-borderline bg-surface p-4 sm:p-8">
              <div className="mb-4 flex flex-col items-start justify-between gap-1.5 border-b-2 border-borderline pb-3 sm:mb-5 sm:flex-row sm:items-end sm:gap-2">
                <h2 className="font-display text-lg font-bold text-ink sm:text-2xl">
                  {t.caseStudy.galleryTitle}
                </h2>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  {t.caseStudy.clickToZoom} ({gallery.length})
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                {gallery.map((item, idx) => {
                  const caption =
                    locale === "id"
                      ? item.caption_id || item.caption_en
                      : item.caption_en || item.caption_id;

                  return (
                    <figure
                      key={`${item.url}-${idx}`}
                      className="group overflow-hidden border-2 border-borderline bg-canvas shadow-brutal-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal"
                    >
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(idx)}
                        className="relative block aspect-[16/10] w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                      >
                        <img
                          src={item.url}
                          alt={caption || `${title} documentation ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        <span className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center border border-borderline bg-surface/95 text-ink opacity-90 transition-opacity group-hover:opacity-100">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </span>
                        <span className="absolute bottom-2 left-2 border border-borderline bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-canvas">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </button>

                      {caption && (
                        <figcaption className="border-t-2 border-borderline bg-surface px-3 py-2 font-mono text-xs text-muted">
                          {caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Previous / Next Project */}
        {(prevProject || nextProject) && (
          <div className="mt-10 grid gap-4 border-t-2 border-borderline pt-6 sm:mt-12 sm:grid-cols-2 sm:pt-8">
            <div>
              {prevProject && (
                <Link
                  href={`/projects/${prevProject.slug}`}
                  className="brutal-interactive block bg-surface p-4"
                >
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    ← {t.caseStudy.previousProject}
                  </span>
                  <p className="mt-1 font-display text-base font-bold text-ink">
                    {locale === "id" ? prevProject.title_id : prevProject.title_en}
                  </p>
                </Link>
              )}
            </div>
            <div>
              {nextProject && (
                <Link
                  href={`/projects/${nextProject.slug}`}
                  className="brutal-interactive block bg-surface p-4 text-left sm:text-right"
                >
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                    {t.caseStudy.nextProject} <ArrowRight className="h-3 w-3" />
                  </span>
                  <p className="mt-1 font-display text-base font-bold text-ink">
                    {locale === "id" ? nextProject.title_id : nextProject.title_en}
                  </p>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal (with Touch Swipe Support) */}
      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2.5 backdrop-blur-sm sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null || gallery.length <= 1) return;
              const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
              const delta = endX - touchStartX.current;
              touchStartX.current = null;
              if (Math.abs(delta) > 45) {
                setLightboxIndex((prev) => {
                  if (prev === null) return null;
                  return delta < 0
                    ? (prev + 1) % gallery.length
                    : (prev - 1 + gallery.length) % gallery.length;
                });
              }
            }}
            className="w-full max-w-5xl border-2 border-borderline bg-surface shadow-brutal-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-borderline px-3 py-2.5 sm:px-4 sm:py-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                DOC // {String(lightboxIndex + 1).padStart(2, "0")} OF{" "}
                {String(gallery.length).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() =>
                        setLightboxIndex(
                          (lightboxIndex - 1 + gallery.length) % gallery.length
                        )
                      }
                      className="inline-flex h-10 w-10 items-center justify-center border-2 border-borderline bg-canvas text-ink hover:bg-ink hover:text-canvas sm:h-8 sm:w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() =>
                        setLightboxIndex((lightboxIndex + 1) % gallery.length)
                      }
                      className="inline-flex h-10 w-10 items-center justify-center border-2 border-borderline bg-canvas text-ink hover:bg-ink hover:text-canvas sm:h-8 sm:w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="inline-flex h-10 items-center gap-1 border-2 border-borderline bg-ink px-3 font-mono text-xs font-bold uppercase text-canvas sm:h-8"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>{t.caseStudy.closePreview}</span>
                </button>
              </div>
            </div>

            <div className="flex max-h-[72vh] items-center justify-center bg-canvas p-2 sm:max-h-[75vh] sm:p-3">
              <img
                src={activePhoto.url}
                alt={
                  (locale === "id"
                    ? activePhoto.caption_id || activePhoto.caption_en
                    : activePhoto.caption_en || activePhoto.caption_id) || title
                }
                className="max-h-[68vh] w-auto max-w-full object-contain sm:max-h-[70vh]"
              />
            </div>

            {(activePhoto.caption_en || activePhoto.caption_id) && (
              <div className="border-t-2 border-borderline bg-surface px-3 py-2.5 font-mono text-xs text-ink sm:px-4 sm:py-3">
                {locale === "id"
                  ? activePhoto.caption_id || activePhoto.caption_en
                  : activePhoto.caption_en || activePhoto.caption_id}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
