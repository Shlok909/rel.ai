import { cn } from "@/lib/utils/cn";

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function SectionCard({
  children,
  className,
  title,
}: SectionCardProps) {
  return (
    <div className={cn("card-surface p-4", className)}>
      {title && (
        <p className="label-section mb-3">{title}</p>
      )}
      {children}
    </div>
  );
}
