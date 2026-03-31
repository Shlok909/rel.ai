import { getTemplate, buildSystemPrompt } from "./promptTemplates_v2.js";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Generates an AI response securely on the server using Groq.
 * Uses native fetch to avoid unnecessary dependencies.
 * 
 * @param featureId The ID of the feature (e.g. "msg", "tone")
 * @param userPrompt The fully constructed prompt for the user message
 * @param profile The user's profile object (needs age_group, situation, etc ideally mapped to age, sit, hlp)
 * @param language "english" or "hinglish"
 * @returns Validated JSON object dictated by the feature template
 */
export async function generateAIResponse(
  featureId: string,
  userPrompt: string,
  profile: any,
  language: string = "english"
) {
  const template = getTemplate(featureId);
  if (!template) {
    throw new Error(`Feature template not found for: ${featureId}`);
  }

  // Map database profile to prompt format expected by buildSystemPrompt
  const mappedProfile = {
    age: profile?.age_group || "unknown",
    sit: profile?.situation || "unknown",
    hlp: "general relationship help"
  };

  const systemPrompt = buildSystemPrompt(mappedProfile, language);

  let apiKey = process.env.GROQ_KEY_1;
  // If template meta points to secondary key, use it; fallback to main if missing.
  if ((template as any).META.groqKeyEnvVar === "GROQ_KEY_2") {
    apiKey = process.env.GROQ_KEY_2 || process.env.GROQ_KEY_1;
  }

  if (!apiKey) {
    throw new Error("Missing Groq API key configuration (GROQ_KEY_1 or GROQ_KEY_2) in environment variables.");
  }

  const messages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const model = (template as any).META.groqModel || "llama-3.3-70b-versatile";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", response.status, errorText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    
    // Parse using the feature template's layered parser
    const parsed = (template as any).parse(rawText);
    
    // Validate output shape
    const isValid = (template as any).validate(parsed);
    if (!isValid) {
      console.error("Failed to validate parsed AI response:", parsed);
      throw new Error("AI returned invalid structure or empty fields.");
    }

    return parsed;
  } catch (error) {
    console.error(`[generateAIResponse] Error calling Groq for feature ${featureId}:`, error);
    throw error;
  }
}
