import { cn } from "@/lib/utils/cn";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  center?: boolean;
}

export default function ScreenHeader({
  title,
  subtitle,
  className,
  center = false,
}: ScreenHeaderProps) {
  return (
    <div className={cn("pt-6 pb-3", center && "text-center", className)}>
      <h1 className="tracking-tight" style={{ color: "var(--text-strong)" }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
