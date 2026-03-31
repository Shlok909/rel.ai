"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export default function CopyButton({ text, className, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        // Ensure it's not visible
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 active:scale-95",
        copied
          ? "bg-[var(--color-success-dim)] border-[var(--color-success)] text-[var(--color-success)] shadow-[0_0_20px_var(--color-success-dim)]"
          : "bg-[var(--color-bg-elevated)] border-[var(--color-border-soft)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-dim)] text-[var(--color-text-strong)]",
        className
      )}
    >
      <span className="text-[9px] font-black uppercase tracking-[0.2em] pointer-events-none transition-colors group-hover:text-[var(--color-accent)]">
        {copied ? "Copied" : (label || "Copy")}
      </span>
      <div className="w-3.5 h-3.5 relative overflow-hidden pointer-events-none opacity-60">
        <div className={cn(
          "absolute inset-0 transition-all duration-300",
          copied ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
        )}>
          <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div className={cn(
          "absolute inset-0 transition-all duration-300",
          copied ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}>
          <svg fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
