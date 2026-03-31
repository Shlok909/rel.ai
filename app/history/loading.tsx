import AppShell from "@/components/layout/AppShell";
import PageContainer from "@/components/layout/PageContainer";
import TopBar from "@/components/layout/TopBar";

export default function HistoryLoading() {
  return (
    <AppShell>
      <TopBar title="History" />
      <PageContainer>
        <div className="pt-2 pb-8 flex flex-col gap-3 animate-pulse">
          <div className="mb-2 h-3 w-32 bg-[var(--bg-elevated)] rounded-full" />
          
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex flex-col gap-3 card-surface border-none">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1.5">
                  <div className="h-2.5 w-24 bg-[var(--bg-elevated)] rounded-full" />
                  <div className="h-2 w-16 bg-[var(--bg-elevated)] opacity-60 rounded-full" />
                </div>
                <div className="w-4 h-4 rounded-full bg-[var(--bg-elevated)]" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-[var(--bg-elevated)] rounded-md" />
                <div className="h-3 w-4/5 bg-[var(--bg-elevated)] rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
