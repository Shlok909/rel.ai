import { createClient } from "@/lib/supabase/server";
import { FEATURES, canUseFeature as baseCanUseFeature, isFeatureAvailable } from "../config/featureConfig";

export type FeatureAccessState = "live" | "preview" | "locked" | "coming_soon";

/**
 * getUserCredits — fetches real-time credit data for a user.
 * Server-safe.
 */
export async function getUserCredits(userId: string | undefined | null) {
  if (!userId) return null;
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error("Error fetching credits:", error);
    return null;
  }
  return data;
}

/**
 * getUserProfile — fetches real-time profile data for a user.
 * Server-safe.
 */
export async function getUserProfile(userId: string | undefined | null) {
  if (!userId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

/**
 * canUserAccessFeature — high-level check for feature accessibility.
 * Returns both a boolean and the specific reason for failure.
 */
export function canUserAccessFeature(planId: string, featureId: string, credits: number, matUsed: boolean = false) {
  const status = baseCanUseFeature(planId, featureId, credits, matUsed);
  return {
    allowed: status === "allowed",
    reason: status, // "no_credits" | "locked" | "preview_used" | "coming_soon"
  };
}

/**
 * isOutOfCredits — simple check for zero balance.
 */
export function isOutOfCredits(credits: number) {
  return credits <= 0;
}

/**
 * getFeatureAccessState — returns the UI state of a feature.
 * Consolidates the logic for UI rendering decisions.
 */
export function getFeatureAccessState(planId: string, featureId: string): FeatureAccessState {
  if (!isFeatureAvailable(featureId)) return "coming_soon";
  
  const feat = (FEATURES as any)[featureId];
  if (!feat) return "locked";
  
  const access = feat.access[planId as keyof typeof feat.access] || "locked";
  if (access === "preview") return "preview";
  if (access === "full") return "live";
  
  return "locked";
}

/**
 * logUsageAndDeductCredit — called AFTER a successful AI generation.
 * 1. Deducts exactly 1 credit from the user_credits table.
 * 2. Saves an audited record to the history_entries table.
 */
export async function logUsageAndDeductCredit(
  userId: string,
  featureId: string,
  featureName: string,
  inputType: string,
  summaryText: string,
  resultJson: any
) {
  const supabase = await createClient();

  // 1. Fetch current credits
  const { data: creditsData } = await supabase
    .from('user_credits')
    .select('credits_remaining')
    .eq('user_id', userId)
    .single();

  const currentCredits = creditsData?.credits_remaining || 0;
  const newCredits = Math.max(0, currentCredits - 1);

  // 2. Deduct exactly 1 credit
  await supabase
    .from('user_credits')
    .update({ credits_remaining: newCredits })
    .eq('user_id', userId);

  // 3. Save to history_entries
  // The schema expects: user_id, feature_id, feature_name, input_type, summary_text, result_json
  await supabase
    .from('history_entries')
    .insert({
      user_id: userId,
      feature_id: featureId,
      feature_name: featureName,
      input_type: inputType,
      summary_text: summaryText,
      result_json: resultJson,
    });

  return newCredits;
}
