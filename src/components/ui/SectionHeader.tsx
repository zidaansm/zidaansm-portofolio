import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  number: string;
  label: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({
  number,
  label,
  title,
  subtitle,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-7 border-b-2 border-borderline pb-4 sm:mb-10 sm:pb-6", className)}>
      <div className="mb-2.5 flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted sm:mb-3 sm:gap-3 sm:text-xs sm:tracking-[0.18em]">
        <span className="bg-ink px-2 py-0.5 text-canvas">{number}</span>
        <span>/</span>
        <span>{label}</span>
      </div>
      <div className="flex flex-col justify-between gap-3 sm:gap-4 md:flex-row md:items-end">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="max-w-xl text-sm leading-relaxed text-muted md:text-right">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
