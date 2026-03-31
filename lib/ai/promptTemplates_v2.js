/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         REL.AI — PROMPT TEMPLATES v2.1                       ║
 * ║                                                               ║
 * ║  Fixes applied vs v2.0:                                       ║
 * ║   Fix #2  — NEXT_PUBLIC_ removed from all key references      ║
 * ║   Fix #3  — safety logic imported from safetyConfig.js        ║
 * ║   Fix #4  — FEATURE_TEMPLATES only contains live features     ║
 * ║   Fix #6  — uiName intentional English noted in comments      ║
 * ║   Fix #7  — SYSTEM_SAFETY_RULE imported from safetyConfig     ║
 * ║   Fix #8  — iCall number centralised in safetyConfig          ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 *  Groq models:
 *    llama-3.3-70b-versatile      → all text features
 *    llama-3.2-90b-vision-preview → screenshot analysis only
 *
 *  Key routing (server-side only — Fix #2):
 *    process.env.GROQ_KEY_1 → msg, tone          (Understand & Reply)
 *    process.env.GROQ_KEY_2 → meter, flag, mat   (Signals + Handle Issues)
 */

// Fix #3 + Fix #8: Safety logic is the single source of truth in safetyConfig.js
import {
  isInputSafe,
  isSafetyTriggered,
  SYSTEM_SAFETY_RULE,
} from "../config/safetyConfig.js";

export { isInputSafe, isSafetyTriggered };


/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — SHARED UTILITIES
═══════════════════════════════════════════════════════════════ */

/**
 * safeParseJSON — 3-layer JSON extractor.
 *
 * Layer 1: Direct JSON.parse (ideal — model followed instructions)
 * Layer 2: Strip markdown fences, then parse
 * Layer 3: Balanced brace tracking — handles nested objects correctly
 *          (Fix #3 v2.0: upgraded from simple lastIndexOf approach)
 *
 * MVP note: If all 3 layers fail, caller must show fallback UI.
 * Future: Add Zod schema validation + backend retry with stricter prompt.
 *
 * @param {string} rawText — raw AI response
 * @returns {object|null}
 */
export function safeParseJSON(rawText) {
  if (!rawText || typeof rawText !== "string") return null;

  // Layer 1: Direct parse
  try { return JSON.parse(rawText.trim()); } catch {}

  // Layer 2: Strip markdown fences
  try {
    const stripped = rawText
      .replace(/^```json\s*/im, "")
      .replace(/^```\s*/im, "")
      .replace(/```\s*$/im, "")
      .trim();
    return JSON.parse(stripped);
  } catch {}

  // Layer 3: Balanced brace extraction
  try {
    let depth = 0, start = -1;
    for (let i = 0; i < rawText.length; i++) {
      if (rawText[i] === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (rawText[i] === "}") {
        depth--;
        if (depth === 0 && start !== -1) {
          return JSON.parse(rawText.slice(start, i + 1));
        }
      }
    }
  } catch {}

  return null;
}


/**
 * buildSystemPrompt — shared system context injected before every feature prompt.
 *
 * Fix #2: No reference to NEXT_PUBLIC_ keys here.
 * Fix #3 + #8: SYSTEM_SAFETY_RULE imported from safetyConfig — iCall number
 *              is maintained in one place only.
 *
 * @param {object} profile — { age, sit, hlp } from onboarding
 * @param {string} lang    — "english" | "hinglish"
 * @returns {string}
 */
export function buildSystemPrompt(profile, lang) {
  const isHi = lang === "hinglish";

  return `You are Rel.AI — a highly intuitive, high-EQ relationship coach for urban Indians (18-30).
You don't give cookie-cutter advice. You read between the lines, recognize emotional bids, and understand the subtle power dynamics of modern dating.

USER CONTEXT:
- Age group      : ${profile.age || "unknown"}
- Situation      : ${profile.sit || "unknown"}
- Needs help with: ${profile.hlp || "general relationship help"}

LANGUAGE:
${isHi
  ? `Respond in modern, natural Hinglish — blend Hindi and English seamlessly, the way young urban Indians text (e.g., 'vibe', 'scene', 'sorted', 'lowkey', 'FOMO', 'DM', 'ghosting context'). Avoid sounding robotic, try-hard, or literally translated. Rule: If an English term is common in Indian daily life (like 'adjust', 'tension', 'stress', 'chill'), use it instead of formal Hindi.`
  : `Respond in clear, warm, slightly casual English. Tone: like a highly empathetic, perceptive older sibling — NOT a corporate assistant, NOT a clinical therapist.`
}

GLOBAL RULES — follow always, no exceptions:
1. NEVER diagnose anyone or use clinical/psychological labels (e.g. "attachment issues", "codependent")
2. NEVER label a partner as "toxic", "narcissist", "manipulative", "abuser", or similar — describe observable patterns instead
3. NEVER give definitive verdicts about feelings or intentions — frame all outputs as gentle observations
4. AVOID generic obvious advice like "just communicate". Provide nuanced, actionable, micro-pivots.
5. Max 3 emojis per entire response
6. ALWAYS end with the disclaimer: "This is guidance, not certainty."
7. Output ONLY valid JSON — no markdown fences, no prose outside the JSON object
8. NEVER suggest or encourage manipulation, guilt-tripping, jealousy tactics, emotional pressure, or any form of controlling behaviour — not even indirectly
${SYSTEM_SAFETY_RULE}`;
}


/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — FEATURE TEMPLATES (live features only)
   Fix #4: Only the 5 live MVP features are in FEATURE_TEMPLATES.
   coming_soon features (tl, persp, move_pb) have no templates.
═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   FEATURE 1 — MESSAGE ANALYZER
   UI Name  : "Message Analyzer" (Fix #6: intentional English)
   Module   : Understand & Reply
   Groq key : process.env.GROQ_KEY_1  (server-side only — Fix #2)
   Renderer : AnalyzerCards → 3 colored cards (meaning/action/reply)
───────────────────────────────────────────────────────────── */
export const MessageAnalyzer = {

  META: {
    id:            "msg",
    uiName:        "Message Analyzer",
    module:        "Understand & Reply",
    groqKeyEnvVar: "GROQ_KEY_1",          // Fix #2: no NEXT_PUBLIC_
    groqModel:     "llama-3.3-70b-versatile",
    groqModelImg:  "llama-3.2-90b-vision-preview",
    creditCost:    1,
    supportsImage: true,
    isFreeTier:    true,
    status:        "live",
  },

  /**
   * JSON schema — exact shape AI must return.
   * Char limits defined for mobile UI (Fix #5).
   */
  SCHEMA: {
    meaning:    "string | max 280 chars — partner's likely tone, emotion, subtext",
    action:     "string | max 180 chars — what user should do right now, concrete",
    reply:      "string | max 240 chars — message user can copy & send, natural",
    disclaimer: "string — must be: 'This is guidance, not certainty.'",
  },

  /**
   * Text message prompt.
   * Fix #10: lang param removed — handled entirely by buildSystemPrompt().
   */
  buildTextPrompt(message, context) {
    return `Analyze this message and read between the lines. Look for the 'emotional bid' or hidden need behind the words.

PARTNER'S MESSAGE:
"${message}"
${context ? `\nCONTEXT FROM USER:\n"${context}"` : ""}

OUTPUT RULES:
- meaning : max 280 characters. Decode the 'Hidden Why'. Don't just rephrase the message; tell the user something about the partner's internal state that isn't obvious. Focus on the vibe and emotional bid.
- action  : max 180 characters. Concrete next step. Focus on 'Relational Stability'. (e.g., "Give them space to miss you", "Match their vulnerability", "Hold your boundary gently").
- reply   : max 240 characters. A message that feels 'Low Stakes, High Connection'. NEVER sound like a template. Avoid using "I feel..." or "It seems like..." if it feels too 'AI-therapy'. Keep it natural.

Respond ONLY with valid JSON. No markdown. No text outside the JSON:
{
  "meaning": "...",
  "action": "...",
  "reply": "...",
  "disclaimer": "This is guidance, not certainty."
}`;
  },

  /**
   * Screenshot/image prompt.
   * Fix #11: Cautious OCR — infer carefully when text is unclear.
   */
  buildImagePrompt(context) {
    return `Look at this chat screenshot and help the user decode the hidden emotional dynamics.
${context ? `\nCONTEXT FROM USER:\n"${context}"` : ""}

Read the clearly visible chat messages in the screenshot.
If any part is blurry, cropped, or unclear — infer cautiously and avoid certainty in your response. Focus on the relationship momentum shown in the exchange.

OUTPUT RULES:
- meaning : max 280 characters. Likely tone, emotion, subtext, or emotional bid from the visible messages. Explain the *vibe*.
- action  : max 180 characters. Concrete next step for the user to take.
- reply   : max 240 characters. Message user can copy and send next. Keep it natural and unforced.

Respond ONLY with valid JSON. No markdown. No text outside the JSON:
{
  "meaning": "...",
  "action": "...",
  "reply": "...",
  "disclaimer": "This is guidance, not certainty."
}`;
  },

  parse(rawText) {
    const d = safeParseJSON(rawText);
    if (!d) return null;
    if (d.safety_triggered) return { safety_triggered: true, message: d.message };
    if (!d.meaning || !d.action || !d.reply) return null;
    return {
      meaning:    String(d.meaning).slice(0, 300),
      action:     String(d.action).slice(0, 200),
      reply:      String(d.reply).slice(0, 260),
      disclaimer: d.disclaimer || "This is guidance, not certainty.",
    };
  },

  /** Fix #4: all 3 required fields checked (upgraded from v2.0 which only checked meaning+reply) */
  validate(parsed) {
    if (!parsed || parsed.safety_triggered) return false;
    return !!(
      typeof parsed.meaning === "string" && parsed.meaning.trim().length > 0 &&
      typeof parsed.action  === "string" && parsed.action.trim().length  > 0 &&
      typeof parsed.reply   === "string" && parsed.reply.trim().length   > 0
    );
  },
};


/* ─────────────────────────────────────────────────────────────
   FEATURE 2 — MULTI-TONE GENERATOR
   UI Name  : "Multi-Tone Message" (Fix #6: intentional English)
   Module   : Understand & Reply
   Groq key : process.env.GROQ_KEY_1  (server-side only — Fix #2)
   Renderer : ToneCards → swipeable version cards + copy + tip
───────────────────────────────────────────────────────────── */
export const MultiToneGenerator = {

  META: {
    id:            "tone",
    uiName:        "Multi-Tone Message",
    module:        "Understand & Reply",
    groqKeyEnvVar: "GROQ_KEY_1",
    groqModel:     "llama-3.3-70b-versatile",
    creditCost:    1,
    supportsImage: false,
    isFreeTier:    true,
    status:        "live",
  },

  SCHEMA: {
    versions: [
      {
        label:   "string | max 30 chars — short evocative style label",
        message: "string | max 220 chars — actual message, ready to copy",
      },
    ],
    tip:        "string | max 180 chars — practical tip on using these messages",
    disclaimer: "string — must be: 'This is guidance, not certainty.'",
  },

  TONE_DESCRIPTIONS: {
    casual:     "relaxed, low-pressure, high comfort (driver: safe connection)",
    flirty:     "playful, building tension, charming (driver: romantic curiosity, NOT cheesy or creepy)",
    mature:     "grounded, secure attachment, high-EQ (driver: vulnerability + respect, avoid sounding like a 'HR email')",
    apologetic: "sincere, warm, repair-focused (driver: taking ownership without grovelling)",
    confident:  "direct, secure, kind (driver: self-respecting energy, no games)",
  },

  /** Fix #10: lang removed from params */
  buildPrompt(tone, purpose, context) {
    const toneDesc = this.TONE_DESCRIPTIONS[tone] || tone;
    return `Generate 3 completely different ${tone} messages for this purpose: "${purpose}"
${context ? `\nSITUATION: "${context}"` : ""}

TONE STYLE: ${toneDesc}

RULES:
- Each version must feel genuinely different — vary opening, energy, and phrasing.
- Messages MUST sound human, modern, and natural. NEVER use "corporate-styled", overly polite, or generic AI language.
- Keep it brief. Real texts are often short.
- Each message max 220 characters.
- Tip max 180 characters. Suggest a nuanced way to use the message.
- NEVER suggest manipulation, jealousy tactics, or emotional pressure.

Respond ONLY with valid JSON. No markdown. No text outside the JSON:
{
  "versions": [
    { "label": "3-4 word style label e.g. 'Warm & Curious'",  "message": "actual message text" },
    { "label": "3-4 word style label e.g. 'Playful & Light'", "message": "actual message text" },
    { "label": "3-4 word style label e.g. 'Bold & Direct'",   "message": "actual message text" }
  ],
  "tip": "One practical, high-EQ tip on timing or phrasing nuances.",
  "disclaimer": "This is guidance, not certainty."
}`;
  },

  parse(rawText) {
    const d = safeParseJSON(rawText);
    if (!d) return null;
    if (d.safety_triggered) return { safety_triggered: true, message: d.message };
    if (!Array.isArray(d.versions) || d.versions.length === 0) return null;
    return {
      versions: d.versions
        .filter(v => v && typeof v.message === "string" && v.message.trim())
        .slice(0, 3)
        .map(v => ({
          label:   String(v.label || "").slice(0, 40),
          message: String(v.message).slice(0, 240),
        })),
      tip:        String(d.tip || "").slice(0, 200),
      disclaimer: d.disclaimer || "This is guidance, not certainty.",
    };
  },

  /** Fix #4: validates array length AND each item's required fields */
  validate(parsed) {
    if (!parsed || parsed.safety_triggered) return false;
    return !!(
      Array.isArray(parsed.versions) &&
      parsed.versions.length > 0 &&
      parsed.versions.every(v =>
        typeof v.label   === "string" && v.label.trim().length   > 0 &&
        typeof v.message === "string" && v.message.trim().length > 0
      )
    );
  },
};


/* ─────────────────────────────────────────────────────────────
   FEATURE 3 — INTEREST-O-METER  (Signs & Observations)
   UI Name  : "Signs & Observations"  (Fix #1 from featureConfig)
   Internal : "Interest-O-Meter"
   Module   : Read the Signals
   Groq key : process.env.GROQ_KEY_2  (server-side only — Fix #2)
   Renderer : SignalCards → vibe bar + signal rows + overall read + tips
───────────────────────────────────────────────────────────── */
export const InterestOMeter = {

  META: {
    id:            "meter",
    uiName:        "Signs & Observations",
    internalName:  "Interest-O-Meter",
    module:        "Read the Signals",
    groqKeyEnvVar: "GROQ_KEY_2",
    groqModel:     "llama-3.3-70b-versatile",
    creditCost:    1,
    supportsImage: false,
    isFreeTier:    true,
    status:        "live",
  },

  SCHEMA: {
    vibe_label:   "string | max 40 chars — 3-5 evocative non-definitive words",
    vibe_level:   "number 1–5 — signal strength (1=unclear, 3=mixed, 5=strong signals)",
    signals: [
      {
        label:       "string | max 30 chars — short signal name",
        observation: "string | max 200 chars — warm observational 1-2 sentences",
      },
    ],
    overall_read: "string | max 280 chars — warm honest overall read, acknowledges uncertainty",
    tips:         ["string | max 160 chars each"],
    disclaimer:   "string — must be: 'This is guidance, not certainty.'",
  },

  QUESTIONS: [
    { key: "freq",  label: "How often do you interact?",       options: ["Daily", "Few times a week", "Rarely"] },
    { key: "reply", label: "How quickly do they reply?",       options: ["Immediately", "Within hours", "A day or more", "Inconsistent"] },
    { key: "topic", label: "Topics you usually discuss?",      options: ["Deep & personal", "Mixed topics", "Just small talk"] },
    { key: "eye",   label: "Their eye contact with you?",      options: ["Warm & holds it", "Brief glances", "Avoids it"] },
    { key: "body",  label: "Their body language around you?",  options: ["Open & leaning in", "Neutral", "Distant / closed"] },
  ],

  /**
   * Fix #6: vibe_label examples softened — no "Strong Mutual Interest"
   * Fix #7: explicit rule — never say definitively they like or don't like user
   * Fix #10: lang removed from params
   */
  buildPrompt(answers) {
    const answerBlock = this.QUESTIONS
      .map(q => `- ${q.label}: ${answers[q.key] || "not answered"}`)
      .join("\n");

    return `Based on these behavioral observations, create a warm "Signs & Observations" reading that focuses on Relational Momentum, not just "like/dislike".

USER'S ANSWERS:
${answerBlock}

RULES (strictly follow):
- DO NOT give a percentage or numerical score.
- NEVER say definitively that they like or don't like the user.
- NEVER say "they are definitely interested" or "they are not interested".
- Frame all outputs as gentle, open observations — not conclusions.
- vibe_label: 3-5 evocative words. Use 'Urban Momentum' terms (e.g., "Comfortable Slow-Burn", "Quiet Detachment", "Building Heat", "Guarded Curiosity").
- Signal observation: max 200 characters each. Identify 'The Gap' — if their actions match their words. Explain the subconscious driver.
- overall_read: max 280 characters. Synthesize the 'Relational Vibe'. Avoid being 100% certain; focus on 'Likely Trajectories'.
- Each tip: max 160 characters. A 'Micro-Move' to test the waters or protect peace.

Respond ONLY with valid JSON. No markdown. No text outside the JSON:
{
  "vibe_label": "3-5 evocative non-definitive words",
  "vibe_level": <1–5 integer>,
  "signals": [
    { "label": "Signal name (max 30 chars)", "observation": "1-2 warm observational sentences (max 200 chars)" },
    { "label": "...", "observation": "..." },
    { "label": "...", "observation": "..." }
  ],
  "overall_read": "2-3 sentences. Warm, honest, acknowledge uncertainty. Max 280 chars.",
  "tips": [
    "Specific thing to try or observe next. Max 160 chars.",
    "Mindset or action helpful regardless of outcome. Max 160 chars."
  ],
  "disclaimer": "This is guidance, not certainty."
}`;
  },

  parse(rawText) {
    const d = safeParseJSON(rawText);
    if (!d) return null;
    if (d.safety_triggered) return { safety_triggered: true, message: d.message };
    if (!d.vibe_label || !Array.isArray(d.signals) || d.signals.length === 0) return null;
    return {
      vibe_label:   String(d.vibe_label).slice(0, 50),
      vibe_level:   Math.max(1, Math.min(5, Math.round(Number(d.vibe_level)) || 3)),
      signals:      d.signals
        .filter(s => s && typeof s.label === "string" && typeof s.observation === "string")
        .slice(0, 5)
        .map(s => ({ label: s.label.slice(0, 40), observation: s.observation.slice(0, 220) })),
      overall_read: String(d.overall_read || "").slice(0, 300),
      tips:         Array.isArray(d.tips)
        ? d.tips.filter(Boolean).slice(0, 2).map(t => String(t).slice(0, 180))
        : [],
      disclaimer:   d.disclaimer || "This is guidance, not certainty.",
    };
  },

  /** Fix #4: validates vibe_label, vibe_level type, signals array + field types */
  validate(parsed) {
    if (!parsed || parsed.safety_triggered) return false;
    return !!(
      typeof parsed.vibe_label === "string" && parsed.vibe_label.trim().length > 0 &&
      typeof parsed.vibe_level === "number" &&
      Array.isArray(parsed.signals) && parsed.signals.length > 0 &&
      parsed.signals.every(s =>
        typeof s.label       === "string" && s.label.trim().length       > 0 &&
        typeof s.observation === "string" && s.observation.trim().length > 0
      )
    );
  },
};


/* ─────────────────────────────────────────────────────────────
   FEATURE 4 — FLAG DETECTOR  (Patterns to Reflect On)
   UI Name  : "Patterns to Reflect On"  (Fix #1 from featureConfig)
   Internal : "Flag Detector"
   Module   : Read the Signals
   Groq key : process.env.GROQ_KEY_2  (server-side only — Fix #2)
   Renderer : FlagCards → 4 colored cards
───────────────────────────────────────────────────────────── */
export const FlagDetector = {

  META: {
    id:            "flag",
    uiName:        "Patterns to Reflect On",
    internalName:  "Flag Detector",
    module:        "Read the Signals",
    groqKeyEnvVar: "GROQ_KEY_2",
    groqModel:     "llama-3.3-70b-versatile",
    creditCost:    1,
    supportsImage: false,
    isFreeTier:    true,
    status:        "live",
  },

  SCHEMA: {
    observation:      "string | max 280 chars — pattern observed, warm, non-judgmental",
    what_it_may_mean: "string | max 280 chars — 2-3 possible reasons, includes positive interpretations",
    what_to_notice:   "string | max 240 chars — specific things to watch going forward",
    suggested_action: "string | max 180 chars — one concrete, low-pressure step now",
    disclaimer:       "string — must be: 'This is guidance, not certainty.'",
  },

  QUESTIONS: [
    { key: "dur",       label: "How long have you been talking / together?", placeholder: "e.g. 2 months" },
    { key: "who",       label: "Who usually starts conversations?",          placeholder: "Mostly me / mostly them / equal" },
    { key: "pattern",   label: "Their reply pattern?",                       placeholder: "Fast, slow, inconsistent..." },
    { key: "ignored",   label: "Do you ever feel ignored or avoided?",       placeholder: "Yes / No / Sometimes" },
    { key: "confusing", label: "What's confusing you most right now?",       placeholder: "Describe briefly..." },
  ],

  /**
   * Fix #8: framing improved — "warm observational language such as..."
   * Fix #10: lang removed from params
   */
  buildPrompt(answers) {
    const answerBlock = this.QUESTIONS
      .map(q => `- ${q.label}: ${answers[q.key] || "not answered"}`)
      .join("\n");

    return `Help this user reflect on patterns in their relationship dynamic. Focus on the "Dance" — how one person's action might be triggering the other person's reaction.

USER'S ANSWERS:
${answerBlock}

RULES (strictly follow):
- NEVER use "red flag" or "green flag" labels — ever.
- NEVER give a verdict — frame everything as "patterns to reflect on".
- Use warm observational language such as "It seems like…" or "A pattern I notice is…". Avoid awkward first-person statements like "I feel that you…".
- Include multiple possible interpretations in what_it_may_mean — never just one. ALWAYS include one interpretation that assumes "good intent but poor execution" on the partner's part.
- observation     : max 280 characters. Describe the behavioral loop.
- what_it_may_mean: max 280 characters — must include at least 2 different possible reasons (positive + neutral).
- what_to_notice  : max 240 characters. Specific triggers to watch for.
- suggested_action: max 180 characters — one concrete, low-pressure step to shift the dynamic.

Respond ONLY with valid JSON. No markdown. No text outside the JSON:
{
  "observation":      "Pattern description. Warm, specific, non-judgmental. Max 280 chars.",
  "what_it_may_mean": "2-3 possible reasons including positive + neutral interpretations. Max 280 chars.",
  "what_to_notice":   "Specific things to observe going forward. Max 240 chars.",
  "suggested_action": "One concrete, low-pressure step to take now. Max 180 chars.",
  "disclaimer":       "This is guidance, not certainty."
}`;
  },

  parse(rawText) {
    const d = safeParseJSON(rawText);
    if (!d) return null;
    if (d.safety_triggered) return { safety_triggered: true, message: d.message };
    if (!d.observation || !d.suggested_action) return null;
    return {
      observation:      String(d.observation).slice(0, 300),
      what_it_may_mean: String(d.what_it_may_mean || "").slice(0, 300),
      what_to_notice:   String(d.what_to_notice   || "").slice(0, 260),
      suggested_action: String(d.suggested_action).slice(0, 200),
      disclaimer:       d.disclaimer || "This is guidance, not certainty.",
    };
  },

  /** Fix #4: all 4 required string fields strictly validated */
  validate(parsed) {
    if (!parsed || parsed.safety_triggered) return false;
    return !!(
      typeof parsed.observation      === "string" && parsed.observation.trim().length      > 0 &&
      typeof parsed.what_it_may_mean === "string" && parsed.what_it_may_mean.trim().length > 0 &&
      typeof parsed.what_to_notice   === "string" && parsed.what_to_notice.trim().length   > 0 &&
      typeof parsed.suggested_action === "string" && parsed.suggested_action.trim().length > 0
    );
  },
};


/* ─────────────────────────────────────────────────────────────
   FEATURE 5 — MATURITY GUIDE
   UI Name  : "Maturity Guide" (Fix #6: intentional English)
   Module   : Handle Relationship Issues
   Groq key : process.env.GROQ_KEY_2  (server-side only — Fix #2)
   Renderer : MaturityCards → strengths + growth + this week
───────────────────────────────────────────────────────────── */
export const MaturityGuide = {

  META: {
    id:            "mat",
    uiName:        "Maturity Guide",
    module:        "Handle Relationship Issues",
    groqKeyEnvVar: "GROQ_KEY_2",
    groqModel:     "llama-3.3-70b-versatile",
    creditCost:    1,
    supportsImage: false,
    isFreeTier:    true,
    isFreePreview: true,
    status:        "live",
  },

  /**
   * Fix #9: Max 2 strengths (down from 3) to avoid overwhelming user on mobile.
   */
  SCHEMA: {
    strengths: [
      "string | max 200 chars — genuine strength #1, specific to their answers",
      "string | max 200 chars — genuine strength #2, different aspect (max 2 total)",
    ],
    growth_areas: [
      "string | max 200 chars — gentle growth area #1, framed as opportunity",
      "string | max 200 chars — gentle growth area #2 — only if clearly evident",
    ],
    this_week:  "string | max 200 chars — one specific, doable micro-habit for this week",
    disclaimer: "string — must be: 'This is guidance, not certainty.'",
  },

  QUESTIONS: [
    {
      key:            "comm",
      label_en:       "How do you communicate with your partner?",
      label_hi:       "Partner ke saath kaise communicate karte ho?",
      placeholder_en: "e.g. I overthink before texting, go quiet when upset, use lots of emojis",
      placeholder_hi: "Jaise: bahut sochke text karta hoon, gusse mein chup ho jaata hoon",
    },
    {
      key:            "conflict",
      label_en:       "How do you handle disagreements?",
      label_hi:       "Fights ya disagreements mein kya karte ho?",
      placeholder_en: "e.g. I get defensive, try to understand, give silent treatment",
      placeholder_hi: "Jaise: defensive ho jaata hoon, ya samajhne ki koshish karta hoon",
    },
    {
      key:            "rely",
      label_en:       "How reliable are you as a partner?",
      label_hi:       "Partner ke roop mein kitne reliable ho?",
      placeholder_en: "e.g. always keep promises, sometimes forget important things",
      placeholder_hi: "Jaise: vaade nibhata hoon, ya kabhi bhool jaata hoon",
    },
  ],

  /**
   * Fix #9: Prompt explicitly caps at 2 strengths, 1-2 growth areas
   * Fix #10: lang removed from params
   */
  buildPrompt(answers) {
    return `This user wants an honest self-reflection on their relationship maturity.
Be warm, encouraging, and highly perceptive — like a thoughtful older sibling giving real feedback. Find the "hidden strengths" in their perceived flaws.

USER'S SELF-REFLECTION:
- Communication style : ${answers.comm     || "not answered"}
- Handling conflicts  : ${answers.conflict || "not answered"}
- Reliability         : ${answers.rely     || "not answered"}

RULES:
- Identify EXACTLY 2 genuine strengths. Look for the 'Positive Root' of a 'Negative Habit' (e.g., 'Anxiety' = 'High Capacity for Care').
- Identify 1 to 2 growth areas maximum — frame as the 'Next Level' of their maturity, not a failure.
- this_week must be a '10% Pivot' — a tiny, doable action for TODAY that shifts the energy by just 10%. (e.g., "When they ask 'how are you', give one extra detail instead of just 'fine'").
- Tone: Perceptive older sibling. Sharp, warm, zero generic fluff.

Respond ONLY with valid JSON. No markdown. No text outside the JSON:
{
  "strengths": [
    "Genuine strength #1, specific to what they shared. Max 200 chars.",
    "Genuine strength #2, different aspect. Max 200 chars."
  ],
  "growth_areas": [
    "Growth area #1, framed as an opportunity. Max 200 chars.",
    "Growth area #2 — include only if clearly evident. Max 200 chars."
  ],
  "this_week": "One small, specific, achievable action they can start today. Max 200 chars.",
  "disclaimer": "This is guidance, not certainty."
}`;
  },

  parse(rawText) {
    const d = safeParseJSON(rawText);
    if (!d) return null;
    if (d.safety_triggered) return { safety_triggered: true, message: d.message };
    if (!Array.isArray(d.strengths) || d.strengths.length === 0) return null;
    if (!d.this_week) return null;
    return {
      // Fix #9: hard cap at 2 strengths in parse layer too
      strengths:    d.strengths.filter(Boolean).slice(0, 2).map(s => String(s).slice(0, 220)),
      growth_areas: Array.isArray(d.growth_areas)
        ? d.growth_areas.filter(Boolean).slice(0, 2).map(g => String(g).slice(0, 220))
        : [],
      this_week:    String(d.this_week).slice(0, 220),
      disclaimer:   d.disclaimer || "This is guidance, not certainty.",
    };
  },

  /** Fix #4: checks strengths array items types + this_week type + length */
  validate(parsed) {
    if (!parsed || parsed.safety_triggered) return false;
    return !!(
      Array.isArray(parsed.strengths) &&
      parsed.strengths.length > 0 &&
      parsed.strengths.every(s => typeof s === "string" && s.trim().length > 0) &&
      typeof parsed.this_week === "string" && parsed.this_week.trim().length > 0
    );
  },
};


/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — MASTER EXPORT MAP
   Fix #4: Only LIVE features are included here.
   Backend route handlers must call isFeatureAvailable(featureId)
   from featureConfig.js before looking up a template.
   If a featureId is not in this map, it has no template yet.
═══════════════════════════════════════════════════════════════ */

export const FEATURE_TEMPLATES = {
  msg:   MessageAnalyzer,
  tone:  MultiToneGenerator,
  meter: InterestOMeter,
  flag:  FlagDetector,
  mat:   MaturityGuide,
  // tl, persp, move_pb intentionally absent — status: "coming_soon"
};

/**
 * getTemplate — safe lookup that returns null for coming_soon features.
 * Use this instead of FEATURE_TEMPLATES[id] directly.
 *
 * @param {string} featureId
 * @returns {object|null} template object or null if not available
 *
 * @example
 * const template = getTemplate(featureId);
 * if (!template) { return Response.json({ error: "Feature not available" }, { status: 404 }); }
 */
export function getTemplate(featureId) {
  return FEATURE_TEMPLATES[featureId] ?? null;
}
