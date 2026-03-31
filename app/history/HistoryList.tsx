"use client";

import { useState } from "react";
import HistoryCard from "@/components/cards/HistoryCard";

import Link from "next/link";
import Button from "@/components/ui/Button";

interface HistoryEntry {
  id: string;
  feature_name: string;
  created_at: string;
  summary_text: string;
}

export default function HistoryList({ entries }: { entries: HistoryEntry[] }) {
  const [items, setItems] = useState(entries);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return;
    }

    // Optimistic removal
    setItems(prev => prev.filter(item => item.id !== id));

    try {
      const res = await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        setItems(entries); // Revert on failure
      }
    } catch {
      setItems(entries);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear ALL history? This action is permanent.")) {
      return;
    }

    const originalItems = items;
    // Optimistic clear
    setItems([]);

    try {
      const res = await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "all" }),
      });
      if (!res.ok) {
        setItems(originalItems);
      }
    } catch {
      setItems(originalItems);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 pb-12 text-center px-6">
        <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-2xl shadow-[rgba(0,0,0,0.5)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border-soft)]">
          🕰️
        </div>
        <h2 className="text-2xl font-black mb-3 tracking-tight" style={{ color: "var(--text-strong)" }}>
          Your Vault is Empty
        </h2>
        <p className="text-[15px] mb-10 leading-relaxed opacity-60 font-medium" style={{ color: "var(--text-muted)", maxWidth: "280px" }}>
          Your past AI guidance and saved reflections will appear here as you use features.
        </p>
        <Link href="/home" className="w-full max-w-[220px]">
          <Button variant="primary" size="lg" fullWidth>Start Your Journey</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-2 pb-8 flex flex-col gap-4">
      <div className="mb-4 px-1 flex items-center justify-between">
        <p className="label-section uppercase tracking-[0.2em] text-[10px] opacity-40">Recent Insights</p>
        <button 
          onClick={handleClearAll}
          className="text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 px-3 py-1.5 rounded-full border border-[var(--danger-dim)] hover:bg-[var(--danger-dim)]"
          style={{ color: "var(--danger)" }}
        >
          Wipe Vault
        </button>
      </div>
      {items.map((item) => (
        <HistoryCard
          key={item.id}
          featureName={item.feature_name}
          timestamp={formatTimeAgo(item.created_at)}
          summary={item.summary_text}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
      <div className="mt-8 text-center px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 leading-relaxed" style={{ color: "var(--text-faint)" }}>
          End of history &bull; Encrypted & Private
        </p>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
