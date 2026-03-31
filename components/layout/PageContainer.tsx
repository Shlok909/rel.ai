import { cn } from "@/lib/utils/cn";

interface PageContainerProps {
  children: React.ReactNode;
  /** px-padding sides. Default is true (applies --space-page). */
  padded?: boolean;
  /** Extra vertical top padding. Default pt-6. */
  className?: string;
  /** Whether this is a centered hero-type page (no max-width constraint) */
  full?: boolean;
}

/**
 * Reusable vertical scroll container for all inner screens.
 * Wraps content in a column with consistent horizontal padding.
 */
export default function PageContainer({
  children,
  padded = true,
  className,
  full = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 w-full relative",
        !full && "max-w-md md:max-w-2xl lg:max-w-3xl mx-auto",
        padded && "px-5", /* Consistent with --space-page (20px) */
        "pt-2 pb-10", /* Standardized vertical gaps */
        className
      )}
    >
      {children}
    </div>
  );
}
