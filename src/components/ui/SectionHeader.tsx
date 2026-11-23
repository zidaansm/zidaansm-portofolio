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
    <div className={cn("mb-10 border-b-2 border-borderline pb-6", className)}>
      <div className="mb-3 flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        <span className="bg-ink px-2 py-0.5 text-canvas">{number}</span>
        <span>/</span>
        <span>{label}</span>
      </div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
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
