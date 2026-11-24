"use client";

import { Code2, Database, Layers, Terminal } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { TechCapability } from "@/types/portfolio";

const iconMap: Record<string, typeof Code2> = {
  frontend: Code2,
  backend: Layers,
  database: Database,
  tools: Terminal,
};

export function CapabilitiesSection({
  capabilities,
}: {
  capabilities: TechCapability[];
}) {
  const { locale, t } = useLanguage();

  return (
    <section
      id="capabilities"
      className="scroll-mt-16 border-b-2 border-borderline bg-surface/50 py-12 sm:scroll-mt-20 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          number={t.capabilities.sectionNumber}
          label={t.capabilities.sectionLabel}
          title={t.capabilities.title}
          subtitle={t.capabilities.subtitle}
        />

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {capabilities.map((cap, index) => {
            const Icon = iconMap[cap.category_key] ?? Code2;
            const title = locale === "id" ? cap.title_id : cap.title_en;
            const description =
              locale === "id" ? cap.description_id : cap.description_en;

            return (
              <BrutalCard key={cap.id} className="p-4 sm:p-6">
                <div className="mb-3.5 flex items-center justify-between gap-2 border-b-2 border-borderline pb-3 sm:mb-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 border-borderline bg-ink text-canvas">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="truncate font-display text-base font-bold text-ink sm:text-lg">
                      {title}
                    </h3>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-bold text-muted">
                    Q{index + 1}
                  </span>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-muted sm:mb-5">
                  {description}
                </p>

                <ul className="flex flex-wrap gap-1.5 sm:gap-2">
                  {cap.items.map((item) => (
                    <li
                      key={item}
                      className="border-2 border-borderline bg-canvas px-2 py-1 font-mono text-[11px] font-semibold text-ink sm:px-2.5 sm:text-xs"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </BrutalCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
