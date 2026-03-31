import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  planName: string;
  planEmoji: string;
  tagline: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
  isHighlighted?: boolean;
  className?: string;
}

export default function PricingCard({
  planName,
  planEmoji,
  tagline,
  features,
  ctaLabel,
  ctaHref,
  isHighlighted = false,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "p-5 flex flex-col gap-5",
        isHighlighted ? "card-accent glow-accent" : "card-elevated",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: isHighlighted ? "var(--accent-dim)" : "var(--bg-overlay)" }}
        >
          {planEmoji}
        </div>
        <div>
          <p className="text-base font-bold" style={{ color: "var(--text-strong)" }}>
            {planName}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {tagline}
          </p>
        </div>
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-2.5">
        {features.map(({ text, included }) => (
          <li key={text} className="flex items-center gap-2.5 text-sm">
            <span
              className="text-base leading-none flex-shrink-0"
              style={{ color: included ? "var(--success)" : "var(--text-faint)" }}
            >
              {included ? "✓" : "×"}
            </span>
            <span style={{ color: included ? "var(--text-body)" : "var(--text-faint)" }}>
              {text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href={ctaHref} className="w-full">
        <Button
          variant={isHighlighted ? "primary" : "secondary"}
          size="lg"
          fullWidth
        >
          {ctaLabel}
        </Button>
      </Link>
    </div>
  );
}
