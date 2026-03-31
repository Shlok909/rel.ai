"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import CopyButton from "@/components/ui/CopyButton";
import { LoadingResults, ErrorAlert } from "@/components/ui/StateFeedback";
import Link from "next/link";

interface AnalysisResult {
  meaning: string;
  action: string;
  reply: string;
  disclaimer?: string;
}

export default function MessageAnalyzerClient() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError("Please paste a message to analyze.");
      return;
    }
    setError(null);
    setLoading(true);
    // Don't clear result immediately to allow "Try Again" to feel smoother if they just want a new analysis
    // but for UI polish, we'll clear it if it's a fresh start
    if (!result) setResult(null); 

    try {
      const res = await fetch("/api/ai/message-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === "no_credits") {
          router.push(`/subscription?featureId=msg&featureName=Message%20Analyzer&reason=out_of_credits&source=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        throw new Error(data.error || "Something went wrong.");
      }
      
      if (data.success && data.data) {
        setResult(data.data as AnalysisResult);
        router.refresh();
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze message.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setMessage("");
    setContext("");
    setError(null);
  };

  return (
    <>
      <div className="card-surface p-4 sm:p-5 flex flex-col gap-5 shadow-2xl">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: "var(--color-text-faint)" }}>
            The Message
          </label>
          <textarea 
            className="input-base min-h-[140px] resize-none text-[15px] font-medium py-3"
            placeholder="Paste the message you want me to decode..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: "var(--color-text-faint)" }}>
            The Backstory (Optional)
          </label>
          <input 
            className="input-base text-[15px] font-medium"
            placeholder="e.g. 'We haven't talked for 2 days'"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        {error && <ErrorAlert error={error} onRetry={handleAnalyze} />}

        <div className="pt-2">
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            onClick={handleAnalyze}
            loading={loading}
            disabled={!message.trim()}
            className="font-black tracking-tight"
          >
            Decode Dynamics (1 Credit)
          </Button>
        </div>

        <p className="text-[10px] text-center font-bold tracking-widest opacity-30 mt-1 uppercase" style={{ color: "var(--color-text-faint)" }}>
          Neural Analysis &bull; Private
        </p>
      </div>

      {loading && !result && <LoadingResults message="Decoding social dynamics..." />}

      {result && !loading && (
        <div className="mt-10 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {(result as any).safety_triggered ? (
            <div className="card-warning flex flex-col gap-4 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛡️</span>
                <h2 className="text-xl font-black leading-tight" style={{ color: "var(--color-text-strong)" }}>A Note on Your Well-being</h2>
              </div>
              <p className="text-[15px] leading-relaxed font-medium" style={{ color: "var(--color-text-body)" }}>
                {(result as any).message}
              </p>
              <Button 
                variant="secondary" 
                size="md" 
                className="mt-2 font-bold"
                onClick={() => window.open('https://icallhelpline.org', '_blank')}
              >
                Visit iCall Helpline
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-black tracking-tighter" style={{ color: "var(--color-text-strong)" }}>Generated Insights</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]" style={{ color: "var(--color-text-muted)" }}>LIVE</span>
              </div>
              
              <div className="flex flex-col gap-5">
                <div className="card-surface p-5 sm:p-6 border-[var(--color-border-accent)] bg-[var(--color-bg-elevated)] shadow-xl">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: "var(--color-accent)" }}>
                    <span className="text-xl">💡</span> What they mean
                  </h3>
                  <p className="text-[16px] leading-[1.7] font-medium tracking-tight" style={{ color: "var(--color-text-strong)" }}>{result.meaning}</p>
                </div>
                
                <div className="card-surface p-5 sm:p-6 border-[var(--color-border-soft)]">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                    <span className="text-xl">🎯</span> Strategic Objective
                  </h3>
                  <p className="text-[15px] leading-[1.7] font-medium tracking-tight" style={{ color: "var(--color-text-body)" }}>{result.action}</p>
                </div>
                
                <div className="card-surface p-5 sm:p-6 bg-[var(--color-bg-overlay)] border-[var(--color-accent-border)] relative overflow-hidden group shadow-2xl">
                   <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--color-accent-glow)] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--color-text-strong)" }}>
                        Suggested Reply
                      </h3>
                      <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest leading-none">AI Optimized</p>
                    </div>
                    <CopyButton text={result.reply} />
                  </div>
                  <div className="p-6 sm:p-7 bg-[var(--color-bg-base)] rounded-2xl border border-[var(--color-border-soft)] shadow-inner">
                    <p className="text-[18px] leading-[1.6] font-semibold tracking-tight italic" style={{ color: "var(--color-accent)" }}>&ldquo;{result.reply}&rdquo;</p>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col gap-3 mt-4 px-1">
                 <button 
                  onClick={handleReset}
                  className="w-full py-4 text-[13px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-all border border-dashed border-[var(--color-border-soft)] rounded-2xl active:scale-[0.97]"
                 >
                  Analyze New Message
                 </button>
                 <Link href="/home" className="w-full">
                    <div className="w-full py-4 text-center text-[11px] font-black uppercase tracking-widest text-[var(--color-text-faint)] opacity-60 hover:opacity-100 transition-all">
                      Return to Dashboard
                    </div>
                 </Link>
              </div>

              <div className="text-center pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {result.disclaimer || "Clarity is guidance, not certainty."}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Screenshot UI - Honest Phase 6 Update */}
      {!result && !loading && (
        <div className="mt-8 border-t border-[var(--color-border-subtle)] pt-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-faint)]">OR UPLOAD SCREENSHOT</p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-border)] uppercase tracking-tight">Coming Next</span>
          </div>
          
          <div className="w-full p-6 rounded-2xl border border-[var(--color-border-subtle)] flex flex-col items-center justify-center gap-3 bg-[var(--color-bg-overlay)] group transition-all duration-300 hover:border-[var(--color-accent-border)] active:scale-[0.98]">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-2xl shadow-inner border border-[var(--color-border-soft)]">
              📸
            </div>
            <div className="text-center px-4">
              <h3 className="text-sm font-bold mb-1" style={{ color: "var(--color-text-strong)" }}>Vision Analysis in Development</h3>
              <p className="text-[11px] leading-relaxed mx-auto max-w-[240px]" style={{ color: "var(--color-text-muted)" }}>
                We&apos;re building a next-gen vision engine. For now, please <span className="text-[var(--color-accent)] font-semibold">paste the message text</span> above for the most accurate decoding.
              </p>
            </div>
            <div className="mt-2 pt-3 border-t border-white/5 w-full text-center">
              <p className="text-[9px] font-medium" style={{ color: "var(--color-text-faint)" }}>
                <span className="opacity-70 mr-1 opacity-100 italic">🛡️ Privacy First:</span> Screenshots are processed locally and never stored permanently.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
