import { FEATURES, MODULES, getAccess, isFeatureAvailable, type PLANS } from "../config/featureConfig";
import { getFeatureAccessState } from "./creditAccess";

export { getFeatureAccessState };
export type { FeatureAccessState } from "./creditAccess";

/**
 * getModuleAccessState — determines if a module should be shown as locked or available.
 * A module is considered 'available' if at least one of its features is 'live' or 'preview'
 * for the current plan.
 */
export function getModuleAccessState(planId: string, moduleId: string) {
  const mod = MODULES.find(m => m.id === moduleId);
  if (!mod) return { isLocked: true, reason: "invalid_module" as const };

  const featureStates = mod.features.map(f => getFeatureAccessState(planId, f));
  
  // If ALL features are coming_soon, the module is coming_soon
  if (featureStates.every(s => s === "coming_soon")) {
    return { isLocked: true, reason: "coming_soon" as const };
  }

  // If ALL features are locked for this plan, the module is locked
  if (featureStates.every(s => s === "locked")) {
    return { isLocked: true, reason: "locked" as const };
  }

  // Otherwise, it's available (at least one feature can be viewed/previewed)
  return { isLocked: false, reason: "available" as const };
}

/**
 * getSubscriptionUrl — constructs the subscription redirect URL with context.
 */
export function getSubscriptionUrl(
  featureId: string, 
  featureName: string, 
  source: string, 
  reason: string,
  moduleId?: string,
  moduleName?: string
) {
  const params = new URLSearchParams({
    featureId,
    featureName,
    source,
    reason
  });
  if (moduleId) params.set("moduleId", moduleId);
  if (moduleName) params.set("moduleName", moduleName);
  
  return `/subscription?${params.toString()}`;
}

/**
 * getFeatureRoute — determines the correct destination for a feature attempt.
 */
export function getFeatureRoute(
  featureId: string,
  credits: number,
  planId: string,
  source: string,
  moduleId?: string,
) {
  const access = getFeatureAccessState(planId, featureId);
  const feat = (FEATURES as any)[featureId];
  const mod = MODULES.find(m => m.id === moduleId);

  const moduleSlugMap: Record<string, string> = {
    reply: "understand-reply",
    signals: "read-signals",
    issues: "relationship-issues",
    move: "make-first-move"
  };

  const moduleSlug = moduleId ? (moduleSlugMap[moduleId] || moduleId) : "home";

  // 1. Check for locked/coming_soon
  if (access === "locked" || access === "coming_soon") {
    return getSubscriptionUrl(featureId, feat?.uiName || featureId, source, access, moduleId, mod?.uiName);
  }

  // 2. Check for out of credits
  if (credits <= 0) {
    return getSubscriptionUrl(featureId, feat?.uiName || featureId, source, "out_of_credits", moduleId, mod?.uiName);
  }

  // 3. Allowed
  // Return the feature-specific sub-route
  return `/module/${moduleSlug}/${featureId}`; 
}

/**
 * validateFeatureAccess — central server-side gate for feature pages.
 * Ensures auth, onboarding, plan access, and credits are all valid.
 */
export async function validateFeatureAccess(
  featureId: string, 
  moduleId: string,
  options: { allowUsed?: boolean } = {}
) {
  const { createClient } = await import("@/lib/supabase/server");
  const { getUserCredits, canUserAccessFeature } = await import("./creditAccess");
  const { redirect } = await import("next/navigation");
  const { FEATURES, MODULES } = await import("../config/featureConfig");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Auth check
  if (!user) {
    redirect("/onboarding/auth?login=true");
    throw new Error("Redirecting to auth");
  }

  // 2. Credits & Plan check
  const creditsData = await getUserCredits(user.id);
  const planId = creditsData?.plan_id || "free";
  const credits = creditsData?.credits_remaining ?? 0;

  // 3. Status check (Middleware handles onboarding_completed, but we can double check)
  const { data: profile, error: profileError } = await (supabase
    .from('profiles' as any)
    .select('onboarding_completed, mat_guide_used')
    .eq('id', user.id)
    .single() as any);

  if (profileError || !profile) {
    redirect("/onboarding/language");
    throw new Error("Redirecting to onboarding due to profile error");
  }

  // 4. Feature level check
  const matUsed = !!profile.mat_guide_used;
  const accessCheck = canUserAccessFeature(planId, featureId, credits, matUsed);
  
  if (!accessCheck.allowed) {
    // Special case: if we allow viewing a used preview (to show "Limit Reached" UI)
    if (options.allowUsed && accessCheck.reason === "preview_used") {
      // Allow through
    } else {
      const feat = (FEATURES as any)[featureId];
      const mod = MODULES.find(m => m.id === moduleId);
      
      redirect(getSubscriptionUrl(featureId, feat?.uiName || featureId, "direct_access", accessCheck.reason, moduleId, mod?.uiName));
      throw new Error("Access denied");
    }
  }

  return { 
    user, 
    creditsData, 
    planId, 
    credits, 
    profile,
    matUsed // return this so the page can use it
  };
}
