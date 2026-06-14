import type { HSKLevel } from "@/data/vocabulary";

export type CustomWord = {
  id: string;
  chinese: string;
  pinyin: string;
  meaning: string;
  example?: string;
  createdAt: string;
};

export type UserProfile = {
  name: string;
  level: HSKLevel | null;
  pretestScore: number | null;
  pretestDate: string | null;
  totalXP: number;
  streak: number;
  lastStudyDate: string | null;
};

// SRS card state per vocab id
export type SRSCard = {
  id: string;
  interval: number;      // days until next review
  easeFactor: number;    // 2.5 default
  repetitions: number;
  nextReview: string;    // ISO date string
  lastQuality: number;   // 0-5 last rating
};

const WORDS_KEY = "learnChinese.customWords";
const VIDEO_IDS_KEY = "learnChinese.videoYoutubeIds";
const COMPLETED_KEY = "learnChinese.completedLessons";
const LAST_SKILL_KEY = "learnChinese.lastSkill";
const PROFILE_KEY = "learnChinese.userProfile";
const SRS_KEY = "learnChinese.srsCards";

// ── Video YouTube IDs (user-set, overrides data file) ────────────────────────
export function loadVideoYoutubeIds(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(VIDEO_IDS_KEY) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveVideoYoutubeId(episodeId: string, youtubeId: string) {
  const all = loadVideoYoutubeIds();
  all[episodeId] = youtubeId;
  localStorage.setItem(VIDEO_IDS_KEY, JSON.stringify(all));
}

export function deleteVideoYoutubeId(episodeId: string) {
  const all = loadVideoYoutubeIds();
  delete all[episodeId];
  localStorage.setItem(VIDEO_IDS_KEY, JSON.stringify(all));
}

// ── Fetched transcripts (keyed by YouTube video ID) ───────────────────────────
const VIDEO_TRANSCRIPTS_KEY = "learnChinese.videoTranscripts";

export type FetchedTranscriptLine = {
  start: number;
  end: number;
  chinese: string;
  pinyin: string;
  english: string;
};

export function loadFetchedTranscripts(): Record<string, FetchedTranscriptLine[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(VIDEO_TRANSCRIPTS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveFetchedTranscript(youtubeId: string, lines: FetchedTranscriptLine[]) {
  const all = loadFetchedTranscripts();
  all[youtubeId] = lines;
  localStorage.setItem(VIDEO_TRANSCRIPTS_KEY, JSON.stringify(all));
}

export function deleteFetchedTranscript(youtubeId: string) {
  const all = loadFetchedTranscripts();
  delete all[youtubeId];
  localStorage.setItem(VIDEO_TRANSCRIPTS_KEY, JSON.stringify(all));
}

// ── Custom user-added video episodes ─────────────────────────────────────────
const CUSTOM_EPISODES_KEY = "learnChinese.customEpisodes";

import type { VideoEpisode } from "@/data/videoLessons";

export function loadCustomEpisodes(): VideoEpisode[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_EPISODES_KEY) || "[]");
  } catch { return []; }
}

export function saveCustomEpisode(ep: VideoEpisode) {
  const all = loadCustomEpisodes().filter((e) => e.id !== ep.id);
  all.unshift(ep);
  localStorage.setItem(CUSTOM_EPISODES_KEY, JSON.stringify(all));
}

export function deleteCustomEpisode(id: string) {
  const all = loadCustomEpisodes().filter((e) => e.id !== id);
  localStorage.setItem(CUSTOM_EPISODES_KEY, JSON.stringify(all));
}

// ── Custom Words ─────────────────────────────────────────────────────────────
export function loadCustomWords(): CustomWord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WORDS_KEY) || "[]") as CustomWord[];
  } catch {
    return [];
  }
}

export function saveCustomWords(words: CustomWord[]) {
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
}

// ── Completed Lessons ────────────────────────────────────────────────────────
export function loadCompletedLessons(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]") as string[];
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

// ── User Profile ─────────────────────────────────────────────────────────────
const DEFAULT_PROFILE: UserProfile = {
  name: "",
  level: null,
  pretestScore: null,
  pretestDate: null,
  totalXP: 0,
  streak: 0,
  lastStudyDate: null,
};

export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(stored) } as UserProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function updateStreak(profile: UserProfile): UserProfile {
  const today = new Date().toISOString().split("T")[0];
  if (profile.lastStudyDate === today) return profile;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const streak =
    profile.lastStudyDate === yesterday ? profile.streak + 1 : 1;

  return { ...profile, streak, lastStudyDate: today };
}

export function addXP(amount: number): UserProfile {
  const profile = loadUserProfile();
  const updated = updateStreak({ ...profile, totalXP: profile.totalXP + amount });
  saveUserProfile(updated);
  return updated;
}

// ── SRS (Spaced Repetition) ──────────────────────────────────────────────────
export function loadSRSCards(): Record<string, SRSCard> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SRS_KEY) || "{}") as Record<string, SRSCard>;
  } catch {
    return {};
  }
}

export function saveSRSCards(cards: Record<string, SRSCard>) {
  localStorage.setItem(SRS_KEY, JSON.stringify(cards));
}

// SM-2 algorithm: quality 0=blackout, 1=incorrect, 2=incorrect but easy, 3=correct difficult, 4=correct, 5=perfect
export function reviewCard(vocabId: string, quality: 0 | 1 | 2 | 3 | 4 | 5): SRSCard {
  const all = loadSRSCards();
  const existing = all[vocabId];

  let { interval, easeFactor, repetitions } = existing ?? {
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
  };

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const nextReview = new Date(Date.now() + interval * 86400000)
    .toISOString()
    .split("T")[0];

  const card: SRSCard = {
    id: vocabId,
    interval,
    easeFactor,
    repetitions,
    nextReview,
    lastQuality: quality,
  };

  all[vocabId] = card;
  saveSRSCards(all);
  return card;
}

export function getDueCards(date?: string): string[] {
  const today = date ?? new Date().toISOString().split("T")[0];
  const all = loadSRSCards();
  return Object.values(all)
    .filter((c) => c.nextReview <= today)
    .map((c) => c.id);
}

export function getNewCards(allVocabIds: string[]): string[] {
  const reviewed = new Set(Object.keys(loadSRSCards()));
  return allVocabIds.filter((id) => !reviewed.has(id));
}
