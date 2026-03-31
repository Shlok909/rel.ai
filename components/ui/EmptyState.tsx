import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  emoji = "🕊️",
  title,
  description,
  className,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-8 gap-5",
        className
      )}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-soft)" }}
      >
        {emoji}
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold" style={{ color: "var(--text-strong)" }}>
          {title}
        </p>
        {description && (
          <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
