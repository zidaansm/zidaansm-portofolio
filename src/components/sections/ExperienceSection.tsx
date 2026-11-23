"use client";

import { Building2, MapPin } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Badge } from "@/components/ui/Badge";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Experience } from "@/types/portfolio";

export function ExperienceSection({
  experiences,
}: {
  experiences: Experience[];
}) {
  const { locale, t } = useLanguage();

  if (experiences.length === 0) {
    return null;
  }

  return (
    <section
      id="experience"
      className="scroll-mt-20 border-b-2 border-borderline py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          number={t.experience.sectionNumber}
          label={t.experience.sectionLabel}
          title={t.experience.title}
          subtitle={t.experience.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {experiences.map((exp) => {
            const role = locale === "id" ? exp.role_id : exp.role_en;
            const summary = locale === "id" ? exp.summary_id : exp.summary_en;
            const highlights =
              locale === "id" ? exp.highlights_id : exp.highlights_en;

            return (
              <BrutalCard key={exp.id} className="p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-borderline pb-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>{exp.organization}</span>
                  </div>
                  <Badge variant="solid">{exp.period}</Badge>
                </div>

                <h3 className="font-display text-xl font-bold text-ink">
                  {role}
                </h3>

                <p className="mt-1 flex items-center gap-1 font-mono text-xs text-muted">
                  <MapPin className="h-3 w-3" />
                  <span>{exp.location}</span>
                </p>

                <p className="mt-4 text-sm leading-relaxed text-ink/90">
                  {summary}
                </p>

                {highlights.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-borderline/20 pt-4">
                    {highlights.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs leading-relaxed text-muted sm:text-sm"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-ink" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </BrutalCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
