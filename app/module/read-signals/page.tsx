import AppShell from "@/components/layout/AppShell";
import PageContainer from "@/components/layout/PageContainer";
import TopBar from "@/components/layout/TopBar";
import FeatureToolCard from "@/components/cards/FeatureToolCard";
import { MODULES, FEATURES } from "@/lib/config/featureConfig";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getFeatureAccessState, getModuleAccessState, getSubscriptionUrl, getFeatureRoute } from "@/lib/utils/featureAccess";
import CreditStatusBanner from "@/components/ui/CreditStatusBanner";
import { getUserCredits } from "@/lib/utils/creditAccess";

export default async function ReadSignalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const creditsData = await getUserCredits(user.id);
  const planId = creditsData?.plan_id || "free";

  const moduleId = "signals";
  const moduleData = MODULES.find((m) => m.id === moduleId);
  
  // Enforce module-level access
  const moduleAccess = getModuleAccessState(planId, moduleId);
  if (moduleAccess.isLocked) {
    redirect(getSubscriptionUrl(moduleId, moduleData?.uiName || "Module", "module_page", moduleAccess.reason));
  }

  const moduleFeatures = moduleData?.features || [];

  return (
    <AppShell>
      <TopBar title={moduleData?.uiName || "Read the Signals"} credits={creditsData?.credits_remaining ?? 0} showBack />

      <PageContainer padded className="pb-24 pt-4">
        <div className="mb-10">
          <div className="flex flex-col gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] flex items-center justify-center text-3xl shadow-sm">
              {moduleData?.emoji}
            </div>
            <h1 className="text-3xl font-black tracking-tighter" style={{ color: "var(--text-strong)" }}>
              {moduleData?.uiName}
            </h1>
            <p className="text-[15px] leading-relaxed font-medium opacity-70" style={{ color: "var(--text-muted)" }}>
              {moduleData?.description}
            </p>
          </div>
          
          {/* Low Credits Warning */}
          <CreditStatusBanner credits={creditsData?.credits_remaining ?? 0} />
        </div>

        <div className="flex flex-col gap-3">
          {moduleFeatures.map((fid) => {
            const f = (FEATURES as any)[fid];
            if (!f) return null;

            const accessState = getFeatureAccessState(planId, fid);
            const isLocked = accessState === "locked" || accessState === "coming_soon";
            
            // Badge logic
            const badgeLabel = accessState === "coming_soon" ? "COMING SOON" : 
                              f.isFreePreview ? "PREVIEW" : 
                              f.access[planId as keyof typeof f.access] === "full" ? "FREE" : "BOOST";

            const ctaLabel = isLocked ? "Join the Waitlist" : 
                            (creditsData?.credits_remaining ?? 0) <= 0 ? "Out of Credits" : "Use Feature";
            
            // Centralized routing logic
            const ctaHref = getFeatureRoute(
              fid, 
              creditsData?.credits_remaining ?? 0, 
              planId, 
              "module_detail",
              moduleId
            );

            return (
              <FeatureToolCard
                key={f.id}
                title={f.uiName}
                description={f.description}
                accessState={accessState === "coming_soon" ? "coming-soon" : accessState}
                badgeLabel={badgeLabel}
                ctaLabel={ctaLabel}
                ctaHref={ctaHref}
              />
            );
          })}
        </div>
      </PageContainer>
    </AppShell>
  );
}
