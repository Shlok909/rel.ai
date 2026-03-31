/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║               REL.AI — SAFETY CONFIG                         ║
 * ║                                                               ║
 * ║  Single source of truth for all safety logic.                 ║
 * ║  Imported by: promptTemplates_v2.js, featureConfig.js,        ║
 * ║               and any API route handler that processes input. ║
 * ║                                                               ║
 * ║  Fix #3 applied: removed duplicate keyword lists from         ║
 * ║  promptTemplates_v2.js and featureConfig.js — both now        ║
 * ║  import from here.                                            ║
 * ║                                                               ║
 * ║  Fix #8 note: iCall number kept here as a named constant      ║
 * ║  so it can be updated in one place. Move to env/config        ║
 * ║  in production if region-specific numbers are needed.         ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */


/* ─────────────────────────────────────────────────────────────
   SUPPORT RESOURCES
   Fix #8: hardcoded number moved to a named constant here.
───────────────────────────────────────────────────────────── */

export const SUPPORT_RESOURCES = {
  iCall: {
    name:        "iCall",
    number:      "9152987821",
    description: "Free, confidential mental health support — India",
    url:         "https://icallhelpline.org",
    hours:       "Mon–Sat, 8am–10pm IST",
  },
};

/** Formatted safety message — used in system prompt safety override (Fix #8) */
export const SAFETY_RESPONSE_EN = `This sounds like a serious situation that goes beyond relationship advice.

Please reach out to someone you trust, or contact iCall at ${SUPPORT_RESOURCES.iCall.number} for free, confidential support.

This is guidance, not certainty.`;

export const SAFETY_RESPONSE_HI = `Yeh situation mere liye sirf relationship advice dene se zyada serious lagti hai.

Kisi bharose ke insaan se baat karo, ya iCall ko call karo: ${SUPPORT_RESOURCES.iCall.number} — yeh free aur confidential hai.

This is guidance, not certainty.`;


/* ─────────────────────────────────────────────────────────────
   SAFETY KEYWORDS
   Client-side pre-flight check. Server-side system prompt
   is a second independent layer.

   Categories:
     A — Physical harm / violence
     B — Control / coercion / stalking
     C — Mental health crisis / self-harm
     D — Emotional crisis signals
───────────────────────────────────────────────────────────── */

export const SAFETY_KEYWORDS = [
  // A — Physical harm
  "abuse", "abused", "abusing", "abusive",
  "hit me", "hitting me", "hurting me", "hurt me",
  "he hits", "she hits",
  "violent", "violence",
  "force me", "forced me",
  "physical",

  // B — Control / coercion / stalking
  "manipulat",
  "stalking", "stalked", "stalk",
  "harass",
  "threatening", "threat",
  "scared of", "afraid of",
  "can't leave", "won't let me leave",
  "controls everything", "controls me",
  "tracks my phone",
  "locks me",
  "won't let me go",

  // C — Mental health crisis / self-harm
  "suicide", "suicidal",
  "kill myself",
  "end my life",
  "don't want to live",
  "self harm", "self-harm",
  "cutting myself",
  "hurt myself",

  // D — Emotional crisis signals
  "breakdown", "mental breakdown",
  "can't cope", "can't go on",
  "extreme dependency",
  "can't live without",
  "nothing without",
];


/* ─────────────────────────────────────────────────────────────
   isInputSafe()
   Client-side pre-flight safety check.
   Call this BEFORE every callAI() invocation.

   @param {string | string[]} inputs
     Single string or array of strings (e.g. all form fields combined)
   @returns {boolean}
     true  = input appears safe → proceed with AI call
     false = safety concern detected → show SafetyBanner, skip AI call

   Note: This is a first-pass heuristic. The system prompt contains
   a second, independent safety layer on the model side.
───────────────────────────────────────────────────────────── */

export function isInputSafe(inputs) {
  const text = (
    Array.isArray(inputs)
      ? inputs.join(" ")
      : String(inputs ?? "")
  ).toLowerCase();

  return !SAFETY_KEYWORDS.some(kw => text.includes(kw));
}


/* ─────────────────────────────────────────────────────────────
   SYSTEM PROMPT SAFETY OVERRIDE BLOCK
   Paste this verbatim into buildSystemPrompt() as the last rule.
   The AI must return this exact JSON if triggered.

   Usage:
     import { SYSTEM_SAFETY_RULE } from './safetyConfig';
     // include in system prompt string
───────────────────────────────────────────────────────────── */

export const SYSTEM_SAFETY_RULE = `8. SAFETY OVERRIDE — highest priority rule:
   If the user's input contains ANY mention of: physical abuse, violence, stalking, coercion,
   threats, self-harm, suicidal thoughts, or emotional crisis — do NOT generate normal relationship advice.
   Instead return ONLY this exact JSON and nothing else:
   {"safety_triggered": true, "message": "This sounds serious. Please talk to someone you trust, or call iCall at ${SUPPORT_RESOURCES.iCall.number} — free and confidential. This is guidance, not certainty."}`;


/* ─────────────────────────────────────────────────────────────
   parseSafetyResponse()
   Check if a parsed AI response is a safety trigger.

   @param {object | null} parsed
   @returns {boolean}
───────────────────────────────────────────────────────────── */

export function isSafetyTriggered(parsed) {
  return parsed?.safety_triggered === true;
}
