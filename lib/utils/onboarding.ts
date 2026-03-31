export function saveOnboardingData(key: string, value: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`onboarding_${key}`, value);
  }
}

export interface OnboardingData {
  age_group: string;
  situation: string;
  primary_need: string;
  ai_disclaimer_accepted: boolean;
  ui_language: string;
  ai_language: string;
}

export function getOnboardingData(): OnboardingData | Record<string, never> {
  if (typeof window === "undefined") return {};
  
  const data: OnboardingData = {
    age_group: localStorage.getItem("onboarding_age") || "",
    situation: localStorage.getItem("onboarding_situation") || "",
    primary_need: localStorage.getItem("onboarding_need") || "",
    ai_disclaimer_accepted: localStorage.getItem("onboarding_disclaimer") === "true",
    ui_language: localStorage.getItem("onboarding_ui_language") || "en",
    ai_language: localStorage.getItem("onboarding_language") || "hinglish",
  };
  
  return data;
}

export function clearOnboardingData() {
  if (typeof window !== "undefined") {
    const keys = ["age", "situation", "need", "disclaimer", "language", "ui_language"];
    keys.forEach(k => localStorage.removeItem(`onboarding_${k}`));
  }
}
