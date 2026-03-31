import AppShell from "@/components/layout/AppShell";
import PageContainer from "@/components/layout/PageContainer";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserCredits } from "@/lib/utils/creditAccess";
import HistoryList from "./HistoryList";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch live credits
  const creditsData = await getUserCredits(user?.id);
  const credits = creditsData?.credits_remaining ?? 0;

  // Fetch real history entries, newest first
  let history: any[] = [];
  let fetchError = false;

  try {
    if (user) {
      const { data, error: dbError } = await supabase
        .from("history_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (dbError) throw dbError;
      history = data || [];
    }
  } catch (err) {
    console.error("Error fetching history:", err);
    fetchError = true;
  }

  const isEmpty = history.length === 0 && !fetchError;

  return (
    <AppShell>
      <TopBar title="History" credits={credits} />

      <PageContainer padded className="pb-24 pt-4">
        <div className="mb-8 px-1">
          <h1 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "var(--text-strong)" }}>
            Data Vault
          </h1>
          <p className="text-[14px] font-medium opacity-60 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Your end-to-end encrypted history of AI insights and relationship guidance.
          </p>
        </div>

        {fetchError ? (
          <div className="flex flex-col items-center justify-center pt-24 pb-12 text-center px-4">
            <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mb-6 bg-[var(--danger-dim)] border border-[var(--danger-dim)] shadow-inner">
              ⚠️
            </div>
            <h2 className="text-xl font-black mb-2" style={{ color: "var(--text-strong)" }}>
              Connection Error
            </h2>
            <p className="text-[15px] mb-8 leading-relaxed opacity-60" style={{ color: "var(--text-muted)", maxWidth: "260px" }}>
              We couldn&apos;t reach the lab. Your history is safe, but we can&apos;t load it right now.
            </p>
            <Button variant="primary" size="lg" onClick={() => window.location.reload()}>
              Try Refreshing
            </Button>
          </div>
        ) : (
          <HistoryList entries={history} />
        )}
      </PageContainer>
    </AppShell>
  );
}
