import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import Link from "next/link";

export type AccessState = "live" | "preview" | "locked" | "coming-soon";

interface FeatureToolCardProps {
  title: string;
  description: string;
  accessState: AccessState;
  badgeLabel?: string;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}

export default function FeatureToolCard({
  title,
  description,
  accessState,
  badgeLabel,
  ctaLabel,
  ctaHref,
  className,
}: FeatureToolCardProps) {
  const isLocked = accessState === "locked" || accessState === "coming-soon";

  return (
    <div
      className={cn(
        "p-5 flex flex-col gap-4 relative transition-all duration-200",
        isLocked ? "card-locked" : "card-elevated hover:border-[var(--accent-border)] hover:bg-[var(--bg-overlay)]",
        className
      )}
    >
      {/* Header with Title and Badge */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-[17px] font-black leading-tight tracking-tight"
          style={{ color: isLocked ? "var(--text-faint)" : "var(--text-strong)" }}
        >
          {title}
        </h3>
        {badgeLabel && (
          <span
            className="badge flex-shrink-0 px-2.5 py-1 text-[9px] font-black tracking-widest"
            style={{
              background: isLocked ? "var(--bg-overlay)" : "var(--accent-dim)",
              color: isLocked ? "var(--text-muted)" : "var(--accent)",
              border: `1px solid ${isLocked ? "var(--border-subtle)" : "var(--accent-border)"}`,
            }}
          >
            {badgeLabel}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[13.5px] leading-relaxed font-medium opacity-70" style={{ color: "var(--text-body)" }}>
        {description}
      </p>

      {/* CTA Button */}
      <div className="mt-2">
        <Link href={ctaHref} className="block w-full">
          <Button
            variant={isLocked ? "secondary" : "secondary"} /* We use secondary even for locked, but with the lock icon */
            size="md"
            fullWidth
            className={cn(
               "text-sm font-bold tracking-tight",
               isLocked && "opacity-60 bg-[var(--bg-overlay)] border-[var(--border-subtle)]"
            )}
          >
            {isLocked && <span className="mr-2 text-lg">🔒</span>}
            {ctaLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
