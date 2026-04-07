export type CustomWord = {
  id: string;
  chinese: string;
  pinyin: string;
  meaning: string;
  example?: string;
  createdAt: string;
};

const WORDS_KEY = "learnChinese.customWords";
const COMPLETED_KEY = "learnChinese.completedLessons";
const LAST_SKILL_KEY = "learnChinese.lastSkill";

export function loadCustomWords(): CustomWord[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(WORDS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as CustomWord[];
  } catch {
    return [];
  }
}

export function saveCustomWords(words: CustomWord[]) {
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
}

export function loadCompletedLessons(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(COMPLETED_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

export function addCompletedLesson(key: string): string[] {
  const current = loadCompletedLessons();
  if (!current.includes(key)) {
    current.unshift(key);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
  }
  return current;
}

export function saveLastActiveSkill(skill: string) {
  localStorage.setItem(LAST_SKILL_KEY, skill);
}

export function loadLastActiveSkill(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_SKILL_KEY);
}
