import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/lib/ai/groqClient";
import { FEATURE_TEMPLATES } from "@/lib/ai/promptTemplates_v2.js";
import { getUserCredits, getUserProfile, canUserAccessFeature, logUsageAndDeductCredit } from "@/lib/utils/creditAccess";
import { isInputSafe, SAFETY_RESPONSE_EN } from "@/lib/config/safetyConfig";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Answers object is required." }, { status: 400 });
    }

    // 0. Safety "pre-flight" check
    const allText = Object.values(answers).map(val => String(val));
    if (!isInputSafe(allText)) {
      return NextResponse.json({
        success: true,
        data: {
          safety_triggered: true,
          message: SAFETY_RESPONSE_EN
        }
      });
    }

    // 1. Verify Access & Credits
    const featureId = "flag";
    const userCredits = await getUserCredits(user.id);
    const profile = await getUserProfile(user.id);

    const credits = userCredits?.credits_remaining ?? 0;
    const planId = userCredits?.plan_id || "free";
    const matUsed = !!(profile as any)?.mat_guide_used;

    const accessCheck = canUserAccessFeature(planId, featureId, credits, matUsed);
    if (!accessCheck.allowed) {
      return NextResponse.json({ error: accessCheck.reason }, { status: 403 });
    }

    if (!profile?.onboarding_completed) {
      return NextResponse.json({ error: "Onboarding incomplete" }, { status: 403 });
    }

    // 2. Build User Prompt
    const template = (FEATURE_TEMPLATES as any)[featureId];
    if (!template) {
      return NextResponse.json({ error: "Feature template missing." }, { status: 500 });
    }
    const userPrompt = template.buildPrompt(answers);

    // 3. Generate AI Response
    const language = profile?.ai_language || "english";
    const result = await generateAIResponse(featureId, userPrompt, profile, language);

    if (result && (result as any).safety_triggered) {
      return NextResponse.json({ success: true, data: result, newCredits: credits });
    }

    // 4. Consume Credit & Save History on success
    const uiName = template.META?.uiName || "Patterns to Reflect On";
    const summaryText = answers.confusing
      ? (answers.confusing.length > 50 ? answers.confusing.substring(0, 50) + "..." : answers.confusing)
      : "Pattern reflection";

    const newCredits = await logUsageAndDeductCredit(
      user.id,
      featureId,
      uiName,
      "questionnaire",
      summaryText,
      result
    );

    return NextResponse.json({ success: true, data: result, newCredits });
  } catch (error: any) {
    console.error("API error in patterns:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
