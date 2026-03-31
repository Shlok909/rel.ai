import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface CreditStatusBannerProps {
  credits: number;
  className?: string;
}

export default function CreditStatusBanner({ credits, className }: CreditStatusBannerProps) {
  const isLow = credits > 0 && credits <= 2;
  const isEmpty = credits === 0;

  if (credits > 2) return null;

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border flex flex-col gap-2 transition-all duration-300 animate-in fade-in slide-in-from-top-4",
        isEmpty 
          ? "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]" 
          : "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">
          {isEmpty ? "⚠️" : "⚡"}
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] font-bold" style={{ color: isEmpty ? "#ef4444" : "#f59e0b" }}>
            {isEmpty ? "You've used all your credits for now" : "You're running low on credits"}
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {isEmpty 
              ? "Join the waitlist for Boost to get unlimited access and 100+ weekly credits." 
              : `Only ${credits} credit${credits === 1 ? "" : "s"} remaining this month. Use them wisely!`}
          </p>
        </div>
      </div>
      
      <Link href="/subscription" className="mt-1">
        <div 
          className="text-[12px] font-bold underline decoration-2 underline-offset-4"
          style={{ color: isEmpty ? "#ef4444" : "#f59e0b" }}
        >
          {isEmpty ? "Get Unlimited Credits" : "Upgrade to Boost"}
        </div>
      </Link>
    </div>
  );
}
