/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║            REL.AI — FEATURE CONFIG  v1.1                     ║
 * ║                                                               ║
 * ║  Single source of truth for all feature / plan metadata.     ║
 * ║  Used by: frontend routing, backend auth, credit system,      ║
 * ║           API key selection, UI rendering decisions.          ║
 * ║                                                               ║
 * ║  Fixes applied vs v1.0:                                       ║
 * ║   Fix #1 — move_pb id mismatch corrected in PLANS.access      ║
 * ║   Fix #2 — NEXT_PUBLIC_ removed from Groq key comments        ║
 * ║   Fix #3 — safety logic removed; imported from safetyConfig   ║
 * ║   Fix #4 — coming_soon features clearly documented            ║
 * ║   Fix #6 — uiName_hi clarification comment added              ║
 * ║   Fix #7 — historySummaryKey fallback rule documented         ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

// Fix #3: Safety logic lives in safetyConfig.js — import from there
export { isInputSafe, SAFETY_KEYWORDS, SUPPORT_RESOURCES } from "./safetyConfig.js";


/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — PLAN DEFINITIONS
═══════════════════════════════════════════════════════════════ */

export const PLANS = {

  free: {
    id: "free",
    displayName: "Beginner",
    emoji: "🌱",
    priceINR: 0,
    creditsPerMonth: 5,
    label: "5 credits / month",
    description: "Get started — try the core features",

    /**
     * Feature access map.
     * Keys MUST match exactly the ids in FEATURES below.
     * Fix #1: "move" → "move_pb" — was causing getAccess("elite","move_pb")
     * to always return "locked" because the key didn't exist.
     */
    access: {
      msg: "full",      // Message Analyzer
      tone: "full",      // Multi-Tone Message
      meter: "full",      // Signs & Observations
      flag: "full",      // Patterns to Reflect On
      mat: "preview",   // Maturity Guide — 1-time free preview only
      persp: "locked",    // Perspective Switcher
      tl: "locked",    // Timeline View
      move_pb: "locked",    // Fix #1: was "move" — now correctly "move_pb"
    },

    razorpayPlanId: null,
  },

  boost: {
    id: "boost",
    displayName: "Boost",
    emoji: "🚀",
    priceINR: 75,
    creditsPerMonth: 25,
    label: "25 credits / month",
    description: "Main conversion plan — all core features unlocked",

    access: {
      msg: "full",
      tone: "full",
      meter: "full",
      flag: "full",
      mat: "full",      // Unlimited — no longer preview-only
      persp: "full",      // Perspective Switcher unlocked
      tl: "full",      // Timeline View unlocked
      move_pb: "locked",    // Fix #1: Elite-only — correctly "move_pb"
    },

    razorpayPlanId: "plan_BOOST_REPLACE_WITH_REAL_ID",
  },

  elite: {
    id: "elite",
    displayName: "Unstoppable",
    emoji: "👑",
    priceINR: 150,
    creditsPerMonth: 60,
    label: "60 credits / month",
    description: "Everything unlocked — for power users",

    access: {
      msg: "full",
      tone: "full",
      meter: "full",
      flag: "full",
      mat: "full",
      persp: "full",
      tl: "full",
      move_pb: "full",      // Fix #1: Elite exclusive — correctly "move_pb"
    },

    razorpayPlanId: "plan_ELITE_REPLACE_WITH_REAL_ID",
  },
};


/**
 * getAccess — check access level a plan grants for a feature.
 *
 * Fix #1 before: getAccess("elite", "move_pb") returned "locked"
 * because PLANS.elite.access had key "move" not "move_pb".
 * Now correctly returns "full" for elite.
 *
 * @param {string} planId    — "free" | "boost" | "elite"
 * @param {string} featureId — must match key in PLANS[planId].access exactly
 * @returns {"full" | "preview" | "locked"}
 */
export function getAccess(planId, featureId) {
  return PLANS[planId]?.access[featureId] ?? "locked";
}

/**
 * hasCredits — check user has enough credits for a feature use.
 * @param {number} creditsLeft
 * @param {string} featureId
 * @returns {boolean}
 */
export function hasCredits(creditsLeft, featureId) {
  const cost = FEATURES[featureId]?.creditCost ?? 1;
  return creditsLeft >= cost;
}

/**
 * canUseFeature — single gate before allowing any feature use.
 * Combines: availability check + plan access + credit check.
 *
 * Fix #4: "coming_soon" check enforced here — backend should
 * never attempt to call a template for an unavailable feature.
 *
 * @param {string}  planId
 * @param {string}  featureId
 * @param {number}  creditsLeft
 * @param {boolean} matUsed — whether the 1-time Maturity Guide preview was used
 * @returns {"allowed"|"no_credits"|"locked"|"preview_used"|"coming_soon"}
 */
export function canUseFeature(planId, featureId, creditsLeft, matUsed = false) {
  if (!isFeatureAvailable(featureId)) return "coming_soon";   // Fix #4

  const access = getAccess(planId, featureId);

  if (access === "locked") return "locked";

  if (access === "preview") {
    if (matUsed) return "preview_used";
    if (!hasCredits(creditsLeft, featureId)) return "no_credits";
    return "allowed";
  }

  if (access === "full") {
    if (!hasCredits(creditsLeft, featureId)) return "no_credits";
    return "allowed";
  }

  return "locked";
}


/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — MODULE DEFINITIONS
═══════════════════════════════════════════════════════════════ */

export const MODULES = [
  {
    id: "reply",
    uiName: "Understand & Reply",
    uiName_hi: "Samjho & Jawab Do",
    emoji: "💬",
    description: "Decode messages & craft the perfect reply",
    desc_hi: "Messages decode karo aur perfect reply banao",
    color: "#D4547A",
    glowColor: "rgba(212,84,122,0.16)",
    visibleFrom: "free",
    features: ["msg", "tone"],
  },
  {
    id: "signals",
    uiName: "Read the Signals",
    uiName_hi: "Signals Samjho",
    emoji: "📡",
    description: "Understand what their behavior really means",
    desc_hi: "Unka behavior decode karo aur signals samjho",
    color: "#8B7FF0",
    glowColor: "rgba(139,127,240,0.16)",
    visibleFrom: "free",
    features: ["meter", "flag", "tl"],
  },
  {
    id: "issues",
    uiName: "Handle Relationship Issues",
    uiName_hi: "Issues Handle Karo",
    emoji: "🔄",
    description: "Grow together & resolve conflicts with clarity",
    desc_hi: "Saath grow karo aur conflicts resolve karo",
    color: "#3DB87A",
    glowColor: "rgba(61,184,122,0.16)",
    visibleFrom: "free",
    features: ["mat", "persp"],
  },
  {
    id: "move",
    uiName: "Make the First Move",
    uiName_hi: "Pehla Kadam Uthao",
    emoji: "💪",
    description: "Build confidence & take action with courage",
    desc_hi: "Confidence build karo aur pehla kadam uthao",
    color: "#C9933A",
    glowColor: "rgba(201,147,58,0.16)",
    visibleFrom: "free",   // module card visible to all; features inside locked until elite
    // Fix #1: feature id is move_pb, not move
    features: ["move_pb"],
  },
];


/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — FEATURE DEFINITIONS
═══════════════════════════════════════════════════════════════ */

/**
 * Fix #6 — uiName_hi note:
 * Some features intentionally use English even in Hinglish mode
 * (e.g. "Message Analyzer", "Multi-Tone Message", "Maturity Guide")
 * because these terms are already commonly used as-is by young Indians.
 * Update uiName_hi here when localised Hinglish labels are needed.
 *
 * Fix #7 — historySummaryKey note:
 * Defines which input/output field is stored as the session preview
 * snippet in the History panel.
 * - Built features: key is set, value is stored at save() call time
 * - Coming-soon features: null → fallback to "Session #N" in UI
 * UI fallback rule: `entry.summary || historyfallback(index)`
 */

export const FEATURES = {

  /* ── LIVE — MVP Free Features ───────────────────────────────── */

  msg: {
    id: "msg",
    uiName: "Message Analyzer",
    uiName_hi: "Message Analyzer",    // Fix #6: intentional English
    moduleId: "reply",
    emoji: "🔍",
    status: "live",

    // Fix #2: no NEXT_PUBLIC_ prefix — Groq keys are server-side only
    groqKeySlot: "KEY_1",              // → process.env.GROQ_KEY_1 on server
    groqModel: "llama-3.3-70b-versatile",
    groqModelImg: "llama-3.2-90b-vision-preview",
    supportsImage: true,

    creditCost: 1,
    isFreePreview: false,
    access: { free: "full", boost: "full", elite: "full" },

    description: "Paste their message or upload a screenshot — I'll decode what they really meant.",
    desc_hi: "Message paste karo ya screenshot upload karo — main decode karke bataunga.",
    renderer: "AnalyzerCards",

    historySummaryKey: "input_text",      // stored as msg.slice(0,80) at save time
    maxHistory: 20,
  },

  tone: {
    id: "tone",
    uiName: "Multi-Tone Message",
    uiName_hi: "Multi-Tone Message",  // Fix #6: intentional English
    moduleId: "reply",
    emoji: "✍️",
    status: "live",

    groqKeySlot: "KEY_1",
    groqModel: "llama-3.3-70b-versatile",
    supportsImage: false,

    creditCost: 1,
    isFreePreview: false,
    access: { free: "full", boost: "full", elite: "full" },

    description: "Generate messages in casual, mature, flirty, or apologetic tones.",
    desc_hi: "Alag-alag tones mein messages generate karo.",
    renderer: "ToneCards",

    historySummaryKey: "tone_purpose",    // stored as `${tone} · ${purpose}` at save time
    maxHistory: 20,
  },

  meter: {
    id: "meter",
    uiName: "Signs & Observations",
    uiName_hi: "Signs & Observations",
    internalName: "Interest-O-Meter",  // dev/debug reference only
    moduleId: "signals",
    emoji: "💡",
    status: "live",

    groqKeySlot: "KEY_2",
    groqModel: "llama-3.3-70b-versatile",
    supportsImage: false,

    creditCost: 1,
    isFreePreview: false,
    access: { free: "full", boost: "full", elite: "full" },

    description: "Signs & observations — understand the signals in their behaviour.",
    desc_hi: "Signs & observations — unke behaviour ke signals samjho.",
    renderer: "SignalCards",

    historySummaryKey: "answers_summary", // stored as `Interaction: ${freq} · Reply: ${reply}`
    maxHistory: 20,
  },

  flag: {
    id: "flag",
    uiName: "Patterns to Reflect On",
    uiName_hi: "Patterns to Reflect On",
    internalName: "Flag Detector",     // dev/debug reference only
    moduleId: "signals",
    emoji: "🚩",
    status: "live",

    groqKeySlot: "KEY_2",
    groqModel: "llama-3.3-70b-versatile",
    supportsImage: false,

    creditCost: 1,
    isFreePreview: false,
    access: { free: "full", boost: "full", elite: "full" },

    description: "Reflect on patterns — a 4-part structured analysis of your dynamic.",
    desc_hi: "Patterns reflect karo — 4-part structured analysis.",
    renderer: "FlagCards",

    historySummaryKey: "dur_confusing",   // stored as `Duration: ${dur} · ${confusing.slice(0,50)}`
    maxHistory: 20,
  },

  mat: {
    id: "mat",
    uiName: "Maturity Guide",
    uiName_hi: "Maturity Guide",    // Fix #6: intentional English
    moduleId: "issues",
    emoji: "🌱",
    status: "live",

    groqKeySlot: "KEY_2",
    groqModel: "llama-3.3-70b-versatile",
    supportsImage: false,

    creditCost: 1,
    isFreePreview: true,               // 1-time preview on free plan; full on boost+
    access: { free: "preview", boost: "full", elite: "full" },

    description: "Self-reflection to grow your relationship skills.",
    desc_hi: "Relationship skills grow karne ke liye self-reflection.",
    renderer: "MaturityCards",

    historySummaryKey: "comm_summary",   // stored as `Comm: ${comm.slice(0,60)}`
    maxHistory: 20,
  },

  /* ── COMING SOON — Boost Features ──────────────────────────── */

  /**
   * Fix #4: These features are intentionally marked status: "coming_soon".
   * promptTemplates_v2.js does NOT export templates for these IDs.
   * canUseFeature() returns "coming_soon" for all of them, regardless of plan.
   * UI renders a "Coming Soon" badge — not an error or locked state.
   * Backend route handlers must check isFeatureAvailable() before proceeding.
   */

  tl: {
    id: "tl",
    uiName: "Timeline View",
    uiName_hi: "Timeline View",
    moduleId: "signals",
    emoji: "📈",
    status: "coming_soon",

    groqKeySlot: "KEY_2",           // tentative — confirm when built
    groqModel: "llama-3.3-70b-versatile",
    supportsImage: false,

    creditCost: 1,
    isFreePreview: false,
    access: { free: "locked", boost: "full", elite: "full" },

    description: "See how interest has shifted over time with a visual graph.",
    desc_hi: "Time ke saath interest trend dekho — visual graph mein.",
    renderer: "TimelineChart",   // to be built in v2

    historySummaryKey: null,            // Fix #7: null → UI shows "Session #N"
    maxHistory: 10,
  },

  persp: {
    id: "persp",
    uiName: "Perspective Switcher",
    uiName_hi: "Perspective Switcher",
    moduleId: "issues",
    emoji: "🪞",
    status: "coming_soon",

    groqKeySlot: "KEY_2",
    groqModel: "llama-3.3-70b-versatile",
    supportsImage: false,

    creditCost: 1,
    isFreePreview: false,
    access: { free: "locked", boost: "full", elite: "full" },

    description: "See both sides of a conflict and find your path forward.",
    desc_hi: "Conflict ke dono sides dekho aur raasta nikalo.",
    renderer: "PerspectiveCards",  // to be built

    historySummaryKey: null,              // Fix #7
    maxHistory: 20,
  },

  /* ── COMING SOON — Elite Exclusive ─────────────────────────── */

  move_pb: {
    id: "move_pb",          // Fix #1: consistent id used everywhere
    uiName: "Make the First Move",
    uiName_hi: "Pehla Kadam Uthao",
    moduleId: "move",
    emoji: "💪",
    status: "coming_soon",

    groqKeySlot: "KEY_2",           // tentative — may get KEY_3 as load grows
    groqModel: "llama-3.3-70b-versatile",
    supportsImage: false,

    creditCost: 1,
    isFreePreview: false,
    // Fix #1: access key is "move_pb" — getAccess("elite","move_pb") now returns "full"
    access: { free: "locked", boost: "locked", elite: "full" },

    description: "Confidence building, conversation starters, body language, handling rejection.",
    desc_hi: "Confidence build karo, conversation starters, body language, rejection handle karo.",
    renderer: "PlaybookCards",   // to be built

    historySummaryKey: null,            // Fix #7
    maxHistory: 20,
  },
};


/* ═══════════════════════════════════════════════════════════════
   SECTION 4 — GROQ API KEY ROUTING
   Fix #2: NEXT_PUBLIC_ removed entirely.
   Groq keys must NEVER be prefixed NEXT_PUBLIC_ — that exposes
   them to the browser bundle. Server-side only.
═══════════════════════════════════════════════════════════════ */

/**
 * GROQ_KEY_MAP
 * Maps feature ID → server-side environment variable name.
 *
 * .env.local (never committed to git):
 *   GROQ_KEY_1=gsk_xxxxxxxxxxxxxxxx   ← Understand & Reply
 *   GROQ_KEY_2=gsk_yyyyyyyyyyyyyyyy   ← Signals + Handle Issues
 *
 * Usage in API route (e.g. app/api/ai/route.ts):
 *   const envKey = GROQ_KEY_MAP[featureId];          // e.g. "GROQ_KEY_1"
 *   const apiKey = process.env[envKey];
 *   if (!apiKey) return Response.json({ error: "Key not configured" }, { status: 500 });
 */
export const GROQ_KEY_MAP = {
  msg: "GROQ_KEY_1",
  tone: "GROQ_KEY_1",
  meter: "GROQ_KEY_2",
  flag: "GROQ_KEY_2",
  mat: "GROQ_KEY_2",
  persp: "GROQ_KEY_2",   // coming soon
  tl: "GROQ_KEY_2",   // coming soon
  move_pb: "GROQ_KEY_2",   // coming soon
};

export const GROQ_MODELS = {
  text: "llama-3.3-70b-versatile",
  vision: "llama-3.2-90b-vision-preview",
};

/**
 * getGroqKey — get the env var name for a feature's Groq key.
 * Use in server-side route handlers only.
 *
 * @param {string} featureId
 * @returns {string} env variable name e.g. "GROQ_KEY_1"
 */
export function getGroqKey(featureId) {
  return GROQ_KEY_MAP[featureId] ?? "GROQ_KEY_1";
}


/* ═══════════════════════════════════════════════════════════════
   SECTION 5 — HISTORY CONFIG
═══════════════════════════════════════════════════════════════ */

export const HISTORY_CONFIG = {
  maxSessionsPerFeature: 20,
  autoDeleteAfterDays: 30,
  historyEnabled: ["msg", "tone", "meter", "flag", "mat"],
  historyDisabled: ["tl", "persp", "move_pb"],  // Fix #4: coming_soon

  /**
   * Fix #7: Fallback label when historySummaryKey is null or value is empty.
   * UI usage: entry.summary || HISTORY_CONFIG.summaryFallback(index)
   */
  summaryFallback: (index) => `Session #${index + 1}`,
};


/* ═══════════════════════════════════════════════════════════════
   SECTION 6 — ONBOARDING QUESTIONS
═══════════════════════════════════════════════════════════════ */

export const ONBOARDING_QUESTIONS = [
  {
    id: "age",
    emoji: "🎂",
    en: "What's your age group?",
    hi: "Tumhari age group kya hai?",
    sub_en: "Helps me tailor advice for you",
    sub_hi: "Better advice ke liye",
    options: ["18–21", "22–25", "26–30", "30+"],
  },
  {
    id: "sit",
    emoji: "💭",
    en: "Your current situation?",
    hi: "Abhi tumhari situation?",
    sub_en: "Helps all features work better instantly",
    sub_hi: "Isse saare features better honge",
    options: [
      "I like someone (crush)",
      "I'm talking to someone",
      "I'm in a relationship",
      "It's complicated",
      "Dealing with a breakup",
    ],
  },
  {
    id: "hlp",
    emoji: "🎯",
    en: "What do you need help with most?",
    hi: "Kisme sabse zyada help chahiye?",
    sub_en: "I'll focus on what matters to you",
    sub_hi: "Main wahi pe focus karunga",
    options: [
      "Understanding behavior",
      "Writing messages",
      "Fixing conflicts",
      "Overthinking / confidence",
      "Just exploring",
    ],
  },
  {
    id: "ok",
    emoji: "🤖",
    en: "I'm an AI, not a therapist — okay?",
    hi: "Main AI hoon, therapist nahi — theek hai?",
    sub_en: "Your emotional safety matters to us",
    sub_hi: "Tumhari safety hamari priority hai",
    /**
     * Fix #5 note: Works as a Q&A option for MVP.
     * Production polish: Convert to boolean checkbox consent field
     * for clearer legal/UX consent signalling.
     */
    options: ["Yes, I understand ✓", "It's fine, let's go! 🚀"],
  },
  {
    id: "lng",
    emoji: "🌐",
    en: "Preferred language for the app & AI?",
    hi: "App aur AI ke liye preferred language?",
    sub_en: "Change this anytime from the top toggle",
    sub_hi: "Upar ke toggle se kabhi bhi change karo",
    options: ["English", "Hinglish (Hindi + English)"],
  },
];


/* ═══════════════════════════════════════════════════════════════
   SECTION 7 — HELPER FUNCTIONS
═══════════════════════════════════════════════════════════════ */

/**
 * isFeatureAvailable — is a feature built and usable right now?
 * Fix #4: Use this as a hard gate before any template or AI call.
 *
 * @param {string} featureId
 * @returns {boolean}
 */
export function isFeatureAvailable(featureId) {
  return FEATURES[featureId]?.status === "live";
}

/**
 * getFeaturesForModule — all feature configs for a module.
 * @param {string} moduleId
 * @returns {object[]}
 */
export function getFeaturesForModule(moduleId) {
  return Object.values(FEATURES).filter(f => f.moduleId === moduleId);
}

/**
 * getLiveFeaturesForModule — only built (live) features for a module.
 * Use this when rendering clickable sub-feature cards in the UI.
 * @param {string} moduleId
 * @returns {object[]}
 */
export function getLiveFeaturesForModule(moduleId) {
  return Object.values(FEATURES).filter(
    f => f.moduleId === moduleId && f.status === "live"
  );
}

/**
 * getFeatureDisplayName — UI-facing name, respects language.
 * @param {string} featureId
 * @param {string} lang — "english" | "hinglish"
 * @returns {string}
 */
export function getFeatureDisplayName(featureId, lang = "english") {
  const feat = FEATURES[featureId];
  if (!feat) return featureId;
  return lang === "hinglish" ? (feat.uiName_hi || feat.uiName) : feat.uiName;
}

/**
 * getCreditCost — credit cost for a feature.
 * All MVP features = 1, but keeps it configurable for future pricing.
 * @param {string} featureId
 * @returns {number}
 */
export function getCreditCost(featureId) {
  return FEATURES[featureId]?.creditCost ?? 1;
}
