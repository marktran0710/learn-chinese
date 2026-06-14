export type TranscriptLine = {
  start: number;
  end: number;
  chinese: string;
  pinyin: string;
  english: string;
};

export type EpisodeVocab = {
  chinese: string;
  pinyin: string;
  meaning: string;
};

export type EpisodeQuestion = {
  question: string;
  options: string[];
  answer: number;
};

export type VideoEpisode = {
  id: string;
  youtubeId: string;
  title: string;
  titleZh: string;
  description: string;
  level: string;
  transcript: TranscriptLine[];
  vocab: EpisodeVocab[];
  questions: EpisodeQuestion[];
  // optional show grouping
  show?: string;
  showName?: string;
  showNameZh?: string;
  episode?: string;
  thumbnailUrl?: string;
  duration?: number;
  addedAt?: string;
};

// Built-in episodes array is empty — all videos are user-added via the processor
export const VIDEO_EPISODES: VideoEpisode[] = [];

export function getEpisodeById(id: string): VideoEpisode | undefined {
  return VIDEO_EPISODES.find((e) => e.id === id);
}
