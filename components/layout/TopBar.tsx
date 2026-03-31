"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CreditBadge from "@/components/ui/CreditBadge";
const APP_NAME = "Rel.AI";
import { cn } from "@/lib/utils/cn";

export interface TopBarProps {
  /** If provided, renders an inner page header instead of the home logo */
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  credits?: number;
  language?: string;
  className?: string;
}

export default function TopBar({
  title,
  subtitle,
  showBack = false,
  backHref,
  credits,
  language,
  className,
}: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn("sticky top-0 z-40 flex items-center justify-between px-5", className)}
      style={{
        height: "64px", /* Standard height for consistency */
        background: "rgba(12,12,15,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-3 overflow-hidden min-w-0">
        {/* Back Button */}
        {showBack && (
          <button 
            onClick={handleBack} 
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full transition-all active:scale-90 text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-elevated)]"
            aria-label="Go back"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Title or Logo */}
        {title ? (
          <div className="flex flex-col min-w-0 leading-tight">
            <h2 className="text-[15px] font-bold truncate tracking-tight" style={{ color: "var(--text-strong)" }}>
              {title}
            </h2>
            {subtitle && (
              <span className="text-[10px] truncate uppercase tracking-widest font-bold opacity-60" style={{ color: "var(--text-muted)" }}>{subtitle}</span>
            )}
          </div>
        ) : (
          <Link href="/home" className="flex items-center gap-2 active:scale-95 transition-transform">
            <span className="text-xl font-black tracking-tighter" style={{ color: "var(--text-strong)" }}>
              {APP_NAME}
            </span>
            <span className="badge" style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)", fontSize: "9px" }}>
              beta
            </span>
          </Link>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
        {/* Language Toggle */}
        {language && (
          <Link href="/onboarding/language">
            <button
              className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all active:scale-95"
              style={{
                background: "var(--bg-elevated)",
                color: "var(--text-body)",
                border: "1px solid var(--border-soft)",
              }}
            >
              {language}
            </button>
          </Link>
        )}

        {/* Credit Badge */}
        {credits !== undefined && <CreditBadge credits={credits} short={!!title} />}

        {/* Avatar */}
        {!title && (
          <Link href="/profile" className="ml-1 active:scale-95 transition-transform">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
              style={{
                background: "linear-gradient(135deg, var(--accent-dim) 0%, rgba(232, 114, 154, 0.05) 100%)",
                color: "var(--accent)",
                border: "1px solid var(--accent-border)",
              }}
            >
              S
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
