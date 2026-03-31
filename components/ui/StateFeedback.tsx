"use client";

import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import Link from "next/link";

/* 1. SKELETON PULSE */
export function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={cn(
      "animate-pulse rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-soft)]", 
      className
    )} />
  );
}

/* 2. LOADING AREA (FOR RESULTS) */
export function LoadingResults({ message = "Calculating insights..." }: { message?: string }) {
  return (
    <div className="flex flex-col gap-4 py-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 px-1 mb-2">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-accent)]">{message}</span>
      </div>
      <SkeletonPulse className="h-32 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <SkeletonPulse className="h-24 w-full" />
        <SkeletonPulse className="h-24 w-full" />
      </div>
      <SkeletonPulse className="h-20 w-full" />
    </div>
  );
}

/* 3. EMPTY STATE (CENTERED) */
interface EmptyStateProps {
  icon: string | React.ReactNode;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
}

export function EmptyState({ icon, title, description, ctaText, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in fade-in duration-500">
      <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-xl shadow-[rgba(0,0,0,0.3)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-soft)]">
        {icon}
      </div>
      <h2 className="text-xl font-black mb-2 text-[var(--color-text-strong)]">{title}</h2>
      <p className="text-[14px] leading-relaxed text-[var(--color-text-muted)] max-w-[220px] mb-8">{description}</p>
      {ctaText && ctaHref && (
        <Link href={ctaHref}>
          <Button variant="primary" size="lg" className="px-10">{ctaText}</Button>
        </Link>
      )}
    </div>
  );
}

/* 4. ERROR ALERT (INLINE) */
export function ErrorAlert({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="p-4 rounded-2xl bg-[var(--color-danger-dim)] border border-[var(--color-border-soft)] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">⚠️</span>
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-danger)] leading-none mb-1">System Notice</span>
          <p className="text-[13px] font-bold text-[var(--color-text-strong)] leading-snug">{error}</p>
        </div>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-strong)] underline decoration-[var(--color-danger)] underline-offset-4 active:scale-95 transition-all text-left ml-7"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
