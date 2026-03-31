import { cn } from "@/lib/utils/cn";

export type Plan = "Beginner" | "Boost" | "Elite";

interface PlanBadgeProps {
  plan: Plan;
  className?: string;
}

const PLAN_CONFIG: Record<Plan, { bg: string; color: string; border: string; emoji?: string }> = {
  Beginner: {
    bg: "var(--bg-overlay)",
    color: "var(--text-muted)",
    border: "var(--border-soft)",
  },
  Boost: {
    bg: "var(--accent-dim)",
    color: "var(--accent)",
    border: "var(--accent-border)",
    emoji: "🚀",
  },
  Elite: {
    bg: "rgba(250,204,21,0.10)",
    color: "#f4d060",
    border: "rgba(244,208,96,0.25)",
    emoji: "👑",
  },
};

export default function PlanBadge({ plan, className }: PlanBadgeProps) {
  const config = PLAN_CONFIG[plan];
  return (
    <span
      className={cn("badge gap-1", className)}
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.emoji && <span>{config.emoji}</span>}
      {plan}
    </span>
  );
}
