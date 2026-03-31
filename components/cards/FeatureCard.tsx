import { cn } from "@/lib/utils/cn";

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
  className?: string;
}

export default function FeatureCard({
  emoji,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <div className={cn("card-surface p-4 flex flex-col gap-3", className)}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: "var(--accent-dim)" }}
      >
        {emoji}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
          {title}
        </p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}
