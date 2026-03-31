import { cn } from "@/lib/utils/cn";

interface CreditBadgeProps {
  credits: number;
  className?: string;
  short?: boolean;
}

export default function CreditBadge({ credits, className, short = false }: CreditBadgeProps) {
  const isLow = credits > 0 && credits <= 2;
  const isEmpty = credits === 0;

  // Visual mapping
  let bg = "var(--accent-dim)";
  let color = "var(--accent)";
  let border = "var(--accent-border)";

  if (isLow) {
    bg = "rgba(245, 158, 11, 0.1)"; // Amber-ish
    color = "#f59e0b";
    border = "rgba(245, 158, 11, 0.2)";
  } else if (isEmpty) {
    bg = "rgba(239, 68, 68, 0.1)"; // Red
    color = "#ef4444";
    border = "rgba(239, 68, 68, 0.2)";
  }

  return (
    <div
      className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors", className)}
      style={{
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      <span
        className="text-[13px] leading-none"
        style={{ color: color }}
      >
        ✦
      </span>
      <span
        className="text-[11px] font-bold"
        style={{ color: color }}
      >
        {short ? credits : `Credits left: ${credits}`}
      </span>
    </div>
  );
}
