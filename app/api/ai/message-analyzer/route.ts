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
    const { message, context } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "A valid message string is required." }, { status: 400 });
    }

    // 0. Safety "pre-flight" check
    if (!isInputSafe([message, context || ""])) {
      return NextResponse.json({
        success: true,
        data: {
          safety_triggered: true,
          message: SAFETY_RESPONSE_EN
        }
      });
    }

    // 1. Verify Access & Credits securely on the server
    const featureId = "msg";
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
    const userPrompt = template.buildTextPrompt(message, context || "");

    // 3. Generate AI Response
    // Uses the profile so the AI knows the user's age group and relationship situation
    const language = profile?.ai_language || "english";
    const result = await generateAIResponse(featureId, userPrompt, profile, language);

    if (result && (result as any).safety_triggered) {
      return NextResponse.json({ success: true, data: result, newCredits: credits });
    }

    // 4. Consume Credit & Save History precisely upon success
    const uiName = template.META?.uiName || "Message Analyzer";
    const summaryText = message.length > 50 ? message.substring(0, 50) + "..." : message;
    
    const newCredits = await logUsageAndDeductCredit(
      user.id,
      featureId,
      uiName,
      "text", // input_type
      summaryText,
      result
    );

    return NextResponse.json({ success: true, data: result, newCredits });
  } catch (error: any) {
    console.error("API error in message-analyzer:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
