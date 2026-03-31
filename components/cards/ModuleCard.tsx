import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import PlanBadge from "@/components/ui/PlanBadge";

interface ModuleCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  isPro?: boolean;
  isLocked?: boolean;
  waitlistUrl?: string;
  className?: string;
}

export default function ModuleCard({
  emoji,
  title,
  subtitle,
  description,
  href,
  isPro = false,
  isLocked = false,
  waitlistUrl,
  className,
}: ModuleCardProps) {
  const targetHref = isLocked ? (waitlistUrl || "/subscription") : href;

  return (
    <Link href={targetHref} className={cn("block group", className)}>
      <div
        className={cn(
          "relative p-4 flex items-start gap-4 transition-all duration-150",
          "group-hover:border-[var(--border-medium)]",
          "group-active:scale-[0.99]",
          isLocked ? "card-locked" : "card-elevated"
        )}
      >
        {/* Subtle glow on hover (free modules only) */}
        {!isLocked && (
          <div
            className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
            style={{ boxShadow: "inset 0 0 0 1px var(--accent-border), 0 8px 28px var(--accent-glow)" }}
          />
        )}

        {/* Emoji icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: isLocked ? "var(--bg-overlay)" : "var(--accent-dim)",
          }}
        >
          {isLocked ? "🔒" : emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-sm font-semibold leading-tight"
              style={{ color: isLocked ? "var(--text-faint)" : "var(--text-strong)" }}
            >
              {title}
            </span>
            {isPro && <PlanBadge plan="Boost" />}
          </div>
          <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--text-faint)" }}>
            {subtitle}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className="w-4 h-4 flex-shrink-0 mt-1 transition-transform duration-150 group-hover:translate-x-0.5"
          style={{ color: "var(--text-faint)" }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
