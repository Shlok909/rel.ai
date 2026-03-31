import AppShell from "@/components/layout/AppShell";
import PageContainer from "@/components/layout/PageContainer";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function MakeFirstMovePage() {
  return (
    <AppShell>
      {/* Top Bar matching wireframe style */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
        <Link href="/home" className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center transition-all active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-2" style={{ color: "var(--text-strong)" }}>
          <span>💪</span> Make the First Move
        </h1>
        <div className="flex bg-[var(--bg-surface)] rounded-full p-1 border border-[var(--border-soft)]">
          <div className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[var(--accent)] text-white">EN</div>
          <div className="px-2 py-0.5 text-[10px] font-black rounded-full text-[var(--text-muted)]">HI</div>
        </div>
      </div>

      <PageContainer padded className="pb-32 pt-10 sm:pt-12">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-10 px-2">
          <div className="text-[64px] mb-4 drop-shadow-2xl">
            💪
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-4" style={{ color: "var(--text-strong)" }}>
            Make the First Move
          </h1>
          <p className="text-[15px] font-medium leading-relaxed max-w-[300px]" style={{ color: "var(--text-muted)" }}>
            Build confidence, master body language, and learn to express your feelings — guided step by step.
          </p>
        </div>

        {/* Feature List */}
        <div className="flex flex-col gap-4 mb-10">
          <PremiumRow icon="📖" text="The Full Playbook" />
          <PremiumRow icon="💬" text="Conversation Starters" />
          <PremiumRow icon="🧠" text="Confidence Building" />
          <PremiumRow icon="👁️" text="Reading Initial Reactions" />
          <PremiumRow icon="🧩" text="Handling Rejection Gracefully" />
        </div>

        {/* CTA Button */}
        <Link href="/subscription?plan=elite&featureId=move&featureName=Make%20the%20First%20Move&reason=locked&source=/module/make-first-move" className="block w-full">
          <button 
            className="w-full py-4 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-[rgba(184,134,11,0.2)]"
            style={{ background: "linear-gradient(135deg, #b8860b 0%, #dca54c 100%)", color: "#111" }}
          >
            <span>👑</span> Unlock with Elite →
          </button>
        </Link>

        {/* Footer */}
        <div className="mt-8 text-center flex justify-center">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-[var(--warning)] opacity-60 uppercase">
            <span>⚠️</span> This is guidance, not certainty.
          </div>
        </div>
      </PageContainer>
      
      <BottomNav />
    </AppShell>
  );
}

function PremiumRow({ icon, text }: { icon: string, text: string }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] shadow-md">
      <div className="flex items-center gap-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-[15px] font-medium" style={{ color: "var(--text-body)" }}>{text}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[rgba(184,134,11,0.1)] border border-[rgba(184,134,11,0.2)]">
        <span className="text-[10px]">👑</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#dca54c]">Elite</span>
      </div>
    </div>
  );
}
