import AppShell from "@/components/layout/AppShell";
import PageContainer from "@/components/layout/PageContainer";
import TopBar from "@/components/layout/TopBar";
import { validateFeatureAccess } from "@/lib/utils/featureAccess";
import { FEATURES } from "@/lib/config/featureConfig";
import MaturityGuideClient from "./MaturityGuideClient";

export default async function MaturityGuidePage() {
  const featureId = "mat";
  const moduleId = "issues";
  const feature = (FEATURES as any)[featureId];

  // 1. Protect route
  // We allow access even if used, so the client can show "Limit Reached" or "Upgrade" message instead of a redirect.
  const { credits, matUsed } = await validateFeatureAccess(featureId, moduleId, { allowUsed: true });

  return (
    <AppShell>
      <TopBar title={feature?.uiName || "Maturity"} credits={credits} showBack />

      <PageContainer padded className="pb-24 pt-4">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-dim)] flex items-center justify-center text-3xl mx-auto mb-4">
            {feature?.emoji || "🌱"}
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-strong)" }}>
            {feature?.uiName}
          </h1>
          <p className="text-sm px-4" style={{ color: "var(--text-muted)" }}>
            {feature?.description}
          </p>
        </div>

        <MaturityGuideClient matUsed={matUsed} />

      </PageContainer>
    </AppShell>
  );
}
