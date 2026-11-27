"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Download, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Badge } from "@/components/ui/Badge";
import { BrutalLinkButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { trackPortfolioEvent } from "@/lib/analytics";
import { isExternalUrl } from "@/lib/utils";
import type { Profile } from "@/types/portfolio";

export function HeroSection({ profile }: { profile: Profile }) {
  const { locale, t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  const role = locale === "id" ? profile.role_id : profile.role_en;
  const headline = locale === "id" ? profile.headline_id : profile.headline_en;
  const bio = locale === "id" ? profile.bio_id : profile.bio_en;
  const availability =
    locale === "id"
      ? profile.availability_status_id
      : profile.availability_status_en;

  const animProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section className="swiss-grid-bg border-b-2 border-borderline py-10 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div {...animProps} className="grid gap-8 sm:gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Positioning & CTAs */}
          <div className="lg:col-span-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-3">
              {profile.is_available && (
                <Badge variant="solid">
                  <span className="inline-block h-2 w-2 bg-canvas" />
                  {availability}
                </Badge>
              )}
              <Badge variant="outline">{role}</Badge>
            </div>

            <p className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted sm:mb-3 sm:text-xs sm:tracking-[0.2em]">
              {t.hero.eyebrow}
            </p>

            <h1 className="font-display text-[2rem] font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {profile.full_name}
            </h1>

            <p className="mt-3 max-w-2xl font-display text-lg font-medium leading-snug text-ink/90 sm:mt-4 sm:text-2xl">
              {headline}
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:mt-5 sm:text-lg">
              {bio}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
              <BrutalLinkButton
                href={profile.cv_url || "/cv"}
                external={isExternalUrl(profile.cv_url)}
                size="lg"
                variant="primary"
                className="w-full sm:w-auto"
                onClick={() =>
                  trackPortfolioEvent({
                    event_type: "cv_download",
                    path: profile.cv_url || "/cv",
                  })
                }
              >
                <Download className="h-4 w-4" />
                <span>{t.hero.downloadCv}</span>
              </BrutalLinkButton>

              <BrutalLinkButton
                href="#contact"
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Mail className="h-4 w-4" />
                <span>{t.hero.contactMe}</span>
              </BrutalLinkButton>

              <BrutalLinkButton
                href="#projects"
                size="lg"
                variant="ghost"
                className="min-[380px]:col-span-2 sm:w-auto"
              >
                <span>{t.hero.viewWork}</span>
                <ArrowDownRight className="h-4 w-4" />
              </BrutalLinkButton>
            </div>

            {/* Social Row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t-2 border-borderline/20 pt-5 font-mono text-xs font-semibold uppercase tracking-wider sm:mt-8 sm:gap-6 sm:pt-6">
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink underline-offset-4 hover:underline"
              >
                <span>GitHub</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink underline-offset-4 hover:underline"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 break-all text-muted hover:text-ink"
              >
                <span>{profile.email}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Editorial Portrait & Spec Sheet Card */}
          <div className="lg:col-span-4">
            <BrutalCard className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between border-b-2 border-borderline pb-3">
                <span
                  suppressHydrationWarning
                  className="font-mono text-xs font-bold uppercase tracking-widest text-ink"
                >
                  SPEC SHEET // {new Date().getFullYear()}
                </span>
                <span className="font-mono text-xs text-muted">ID-01</span>
              </div>

              {profile.avatar_url && (
                <div className="group mb-5 overflow-hidden border-2 border-borderline bg-canvas">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="h-full w-full object-cover object-top transition-all duration-300 md:grayscale md:group-hover:scale-[1.02] md:group-hover:grayscale-0"
                    />
                  </div>
                  <div className="flex items-center justify-between border-t-2 border-borderline bg-surface px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span>PORTRAIT</span>
                    <span>{profile.brand_name}</span>
                  </div>
                </div>
              )}

              <dl className="space-y-4 font-mono text-xs">
                <div className="border-b border-borderline/20 pb-3">
                  <dt className="mb-1 text-[11px] uppercase tracking-wider text-muted">
                    {t.hero.locationLabel}
                  </dt>
                  <dd className="flex items-center gap-1.5 font-sans text-sm font-semibold text-ink">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{profile.location}</span>
                  </dd>
                  <dd className="mt-0.5 text-[11px] text-muted">{profile.timezone}</dd>
                </div>

                <div className="border-b border-borderline/20 pb-3">
                  <dt className="mb-1 text-[11px] uppercase tracking-wider text-muted">
                    {t.hero.focusLabel}
                  </dt>
                  <dd className="font-sans text-sm font-semibold text-ink">
                    {t.hero.focusValue}
                  </dd>
                </div>

                <div>
                  <dt className="mb-2 text-[11px] uppercase tracking-wider text-muted">
                    CORE STACK
                  </dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {["PHP / Laravel", "Filament", "MySQL", "Kotlin", "HTML / CSS / JS", "Power BI"].map(
                      (item) => (
                        <span
                          key={item}
                          className="border border-borderline bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </dd>
                </div>
              </dl>
            </BrutalCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
