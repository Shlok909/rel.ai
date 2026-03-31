"use client";

import { cn } from "@/lib/utils/cn";

export interface HistoryCardProps {
  featureName: string;
  timestamp: string;
  summary: string;
  className?: string;
  onDelete?: () => void;
}

export default function HistoryCard({
  featureName,
  timestamp,
  summary,
  className,
  onDelete,
}: HistoryCardProps) {
  return (
    <div
      className={cn(
        "p-5 flex flex-col gap-3 relative transition-all duration-200 card-surface active:scale-[0.98] hover:border-[var(--border-soft)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] mb-1.5" style={{ color: "var(--accent)" }}>
            {featureName}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none" style={{ color: "var(--text-faint)" }}>
              {timestamp}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete?.();
          }}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-dim)]"
          aria-label="Delete entry"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <p className="text-[15px] font-medium leading-relaxed mt-1" style={{ color: "var(--text-strong)" }}>
        {summary}
      </p>
    </div>
  );
}
