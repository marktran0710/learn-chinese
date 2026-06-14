"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { PronunciationPlayer } from "@/lib/pronunciation";
import {
  addCompletedLesson,
  loadCompletedLessons,
  saveLastActiveSkill,
  loadUserProfile,
  addXP,
  reviewCard,
} from "@/lib/storage";
import {
  TOCFL_VOCAB,
  getVocabByLevel,
  getAllLevels,
  LEVEL_DESCRIPTIONS,
} from "@/data/vocabulary";
import type { VocabEntry, HSKLevel } from "@/data/vocabulary";
import { SHIDAI_UNITS, getWordsByUnit } from "@/data/shidaiVocab";
import type { BookWord } from "@/data/shidaiVocab";
import {
  getPassageByLevel,
  getPassageByUnit,
} from "@/data/readingPassages";
import type { ReadingPassage } from "@/data/readingPassages";
import { useTheme } from "@/lib/theme";

function bookWordToVocabEntry(w: BookWord): VocabEntry {
  return {
    id: `book-${w.id}`,
    level: "A1",
    traditional: w.traditional,
    pinyin: w.pinyin,
    meaning: w.meaning,
    partOfSpeech: w.partOfSpeech as VocabEntry["partOfSpeech"],
    example: w.example,
    exampleTranslation: w.exampleEn,
    tags: ["時代華語"],
  };
}

type SkillMode = "browse" | "exercise";

const SKILL_META: Record<
  string,
  { icon: string; color: string; description: string; exerciseLabel: string }
> = {
  reading: {
    icon: "📖",
    color: "from-blue-500 to-blue-700",
    description: "Read the character and recall its meaning",
    exerciseLabel: "Reading Exercise",
  },
  writing: {
    icon: "✍️",
    color: "from-purple-500 to-purple-700",
    description: "Study stroke structure and character composition",
    exerciseLabel: "Writing Exercise",
  },
  listening: {
    icon: "👂",
    color: "from-teal-500 to-teal-700",
    description: "Listen and identify the spoken word",
    exerciseLabel: "Listening Exercise",
  },
  speaking: {
    icon: "🗣️",
    color: "from-orange-500 to-red-600",
    description: "Practice pronunciation with audio feedback",
    exerciseLabel: "Speaking Exercise",
  },
};

const LEVEL_COLORS: Record<HSKLevel, string> = {
  A1: "bg-green-100 text-green-800",
  A2: "bg-teal-100 text-teal-800",
  B1: "bg-blue-100 text-blue-800",
  B2: "bg-purple-100 text-purple-800",
  C1: "bg-orange-100 text-orange-800",
  C2: "bg-red-100 text-red-800",
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildOptions(correct: VocabEntry, pool: VocabEntry[]): VocabEntry[] {
  const distractors = shuffle(pool.filter((v) => v.id !== correct.id)).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

// ── Reading Exercise ──────────────────────────────────────────────────────────
function ReadingExercise({
  passage,
  skill,
  onComplete,
}: {
  passage: ReadingPassage;
  skill: string;
  onComplete: (score: number) => void;
}) {
  const [phase, setPhase] = useState<"read" | "quiz">("read");
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showPinyin, setShowPinyin] = useState(false);

  const q = passage.questions[qIdx];

  function handleAnswer(optIdx: number) {
    if (selected !== null) return;
    setSelected(optIdx);
    const correct = optIdx === q.answer;
    if (correct) setScore((s) => s + 1);
    addXP(correct ? 15 : 5);
    addCompletedLesson(`${skill}-passage-${passage.id}-q${qIdx}`);
    setTimeout(() => {
      if (qIdx + 1 >= passage.questions.length) {
        onComplete(score + (correct ? 1 : 0));
      } else {
        setQIdx((i) => i + 1);
        setSelected(null);
      }
    }, 900);
  }

  if (phase === "read") {
    return (
      <div>
        <p className="text-sm text-gray-500 dark:text-white/70 mb-3">
          Read the passage carefully, then answer {passage.questions.length} comprehension questions.
        </p>
        <div className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-xl mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-white/[0.08] pb-2">{passage.title}</h2>
          <p className="text-2xl leading-relaxed text-gray-800 dark:text-white mb-4">{passage.text}</p>
          {passage.pinyin && showPinyin && (
            <p className="text-sm text-purple-500 dark:text-purple-400 leading-relaxed mb-3">{passage.pinyin}</p>
          )}
          {passage.pinyin && (
            <button
              onClick={() => setShowPinyin((v) => !v)}
              className="text-xs text-blue-400 hover:text-blue-600 mb-3 transition"
            >
              {showPinyin ? "Hide pinyin" : "Show pinyin"}
            </button>
          )}
          <button
            onClick={() => PronunciationPlayer.speak(passage.text, "zh-TW")}
            className="block text-sm text-gray-400 hover:text-gray-600 dark:hover:text-white/60 transition mb-4"
          >
            🔊 Listen to passage
          </button>
          {passage.vocabulary && passage.vocabulary.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 mt-2">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">Key vocabulary</p>
              <div className="flex flex-wrap gap-2">
                {passage.vocabulary.map((v) => (
                  <span key={v.word} className="bg-white dark:bg-white/[0.06] border border-blue-200 dark:border-blue-500/20 rounded-lg px-2 py-1 text-xs text-gray-700 dark:text-white/80">
                    <span className="font-bold text-blue-800 dark:text-blue-300">{v.word}</span> — {v.meaning}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setPhase("quiz")}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg"
        >
          I'm ready — Start Questions →
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-white/70 mb-3">
        Question {qIdx + 1} / {passage.questions.length}
      </p>
      <div className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-xl mb-4">
        <p className="text-lg font-bold text-gray-800 dark:text-white mb-1">{passage.title}</p>
        <p className="text-gray-500 dark:text-white/50 text-sm mb-4 leading-relaxed line-clamp-3">{passage.text}</p>
        <div className="border-t border-gray-200 dark:border-white/[0.08] pt-4">
          <p className="text-xl font-bold text-gray-800 dark:text-white mb-4">{q.question}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => {
          let cls = "p-4 rounded-xl font-medium text-left border-2 transition text-base ";
          if (selected === null) {
            cls += "bg-white dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.1] hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 text-gray-800 dark:text-white";
          } else if (i === q.answer) {
            cls += "bg-green-100 dark:bg-green-500/20 border-green-500 text-green-800 dark:text-green-300";
          } else if (i === selected) {
            cls += "bg-red-100 dark:bg-red-500/20 border-red-400 text-red-700 dark:text-red-300";
          } else {
            cls += "bg-white/60 dark:bg-white/[0.03] border-gray-200 dark:border-white/[0.05] text-gray-400 dark:text-white/30";
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} className={cls}>
              <span className="font-bold mr-2 text-gray-400">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Listening Exercise ────────────────────────────────────────────────────────
function ListeningExercise({
  vocab,
  skill,
  onComplete,
}: {
  vocab: VocabEntry[];
  skill: string;
  onComplete: (score: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [options, setOptions] = useState<VocabEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [played, setPlayed] = useState(false);

  const card = vocab[idx];

  useEffect(() => {
    setOptions(buildOptions(card, vocab));
    setPlayed(false);
  }, [idx, card, vocab]);

  function playAudio() {
    PronunciationPlayer.speak(card.traditional, "zh-TW");
    setPlayed(true);
  }

  function handlePick(picked: VocabEntry) {
    if (selected || !played) return;
    setSelected(picked.id);
    const correct = picked.id === card.id;
    if (correct) setScore((s) => s + 1);
    reviewCard(card.id, correct ? 4 : 1);
    addCompletedLesson(`${skill}-${card.id}`);
    addXP(correct ? 10 : 3);
    setTimeout(() => {
      if (idx + 1 >= vocab.length) onComplete(score + (correct ? 1 : 0));
      else { setIdx((i) => i + 1); setSelected(null); }
    }, 800);
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-white/70 mb-3">
        Question {idx + 1} / {vocab.length} — Listen and choose the correct character
      </p>
      <div className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 text-center mb-4 shadow-xl">
        <button
          onClick={playAudio}
          className={`w-24 h-24 rounded-full text-4xl font-bold transition ${
            played
              ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300"
              : "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:opacity-90 animate-pulse"
          }`}
        >
          🔊
        </button>
        <p className="text-gray-400 dark:text-white/40 mt-3 text-sm">
          {played ? "Listen again if needed" : "Tap to play audio"}
        </p>
        {!played && (
          <p className="text-orange-500 text-xs mt-1">Listen first to unlock answers</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          let cls = "p-4 rounded-xl font-bold text-center border-2 text-2xl transition ";
          if (!selected) {
            cls += played
              ? "bg-white dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.1] hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 text-gray-800 dark:text-white"
              : "bg-gray-100 dark:bg-white/[0.04] border-gray-100 dark:border-white/[0.05] text-gray-300 dark:text-white/30 cursor-not-allowed";
          } else if (opt.id === card.id) {
            cls += "bg-green-100 dark:bg-green-500/20 border-green-500 text-green-800 dark:text-green-300";
          } else if (opt.id === selected) {
            cls += "bg-red-100 dark:bg-red-500/20 border-red-400 text-red-700 dark:text-red-300";
          } else {
            cls += "bg-white/50 dark:bg-white/[0.03] border-gray-200 dark:border-white/[0.05] text-gray-400 dark:text-white/30";
          }
          return (
            <button key={opt.id} onClick={() => handlePick(opt)} className={cls}>
              <div>{opt.traditional}</div>
              <div className="text-sm font-normal text-gray-400 dark:text-white/40">{opt.pinyin}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Speaking Exercise ─────────────────────────────────────────────────────────
function SpeakingExercise({
  vocab,
  skill,
  onComplete,
}: {
  vocab: VocabEntry[];
  skill: string;
  onComplete: (score: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [practiced, setPracticed] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const card = vocab[idx];

  function handleSpeak() {
    PronunciationPlayer.speak(card.traditional, "zh-TW");
    setPracticed(true);
    addCompletedLesson(`${skill}-${card.id}`);
    addXP(8);
    reviewCard(card.id, 4);
  }

  function handleNext() {
    setPracticed(false);
    setShowPinyin(false);
    if (idx + 1 >= vocab.length) onComplete(vocab.length);
    else setIdx((i) => i + 1);
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-white/70 mb-3">
        Card {idx + 1} / {vocab.length} — Practice saying this word aloud
      </p>
      <div className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 text-center mb-4 shadow-xl">
        <div className="text-7xl font-bold text-gray-800 dark:text-white mb-2">{card.traditional}</div>
        <div className="text-gray-400 dark:text-white/40 text-sm mb-2">{card.meaning}</div>
        <button
          onClick={() => setShowPinyin(!showPinyin)}
          className="text-xs text-blue-400 hover:text-blue-600 mb-4 transition"
        >
          {showPinyin ? `📌 ${card.pinyin}` : "Show pinyin"}
        </button>
        {card.example && (
          <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 text-left mt-2">
            <p className="text-gray-700 dark:text-white/80 text-sm">{card.example}</p>
            <p className="text-gray-400 dark:text-white/40 text-xs mt-1">{card.exampleTranslation}</p>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSpeak}
          className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition"
        >
          🎤 Hear & Repeat
        </button>
        {practiced && (
          <button
            onClick={handleNext}
            className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition"
          >
            {idx + 1 >= vocab.length ? "Finish ✓" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Writing Exercise ──────────────────────────────────────────────────────────
function WritingExercise({
  vocab,
  skill,
  onComplete,
}: {
  vocab: VocabEntry[];
  skill: string;
  onComplete: (score: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selfScore, setSelfScore] = useState<"know" | "learning" | null>(null);
  const [score, setScore] = useState(0);
  const card = vocab[idx];

  function handleReveal() {
    setRevealed(true);
  }

  function handleSelf(s: "know" | "learning") {
    setSelfScore(s);
    if (s === "know") {
      setScore((sc) => sc + 1);
      reviewCard(card.id, 4);
      addXP(10);
    } else {
      reviewCard(card.id, 1);
      addXP(3);
    }
    addCompletedLesson(`${skill}-${card.id}`);
    setTimeout(() => {
      if (idx + 1 >= vocab.length) onComplete(score + (s === "know" ? 1 : 0));
      else { setIdx((i) => i + 1); setRevealed(false); setSelfScore(null); }
    }, 500);
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-white/70 mb-3">
        Card {idx + 1} / {vocab.length} — Can you write this character?
      </p>
      <div className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 text-center mb-4 shadow-xl">
        <p className="text-gray-500 dark:text-white/50 text-sm mb-2">Meaning:</p>
        <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{card.meaning}</div>
        <div className="text-gray-400 dark:text-white/40 text-sm italic capitalize mb-4">
          ({card.partOfSpeech})
        </div>

        {!revealed ? (
          <button
            onClick={handleReveal}
            className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-6 py-3 rounded-xl font-medium hover:bg-purple-200 dark:hover:bg-purple-500/30 transition"
          >
            Reveal Character →
          </button>
        ) : (
          <div>
            <div className="text-7xl font-bold text-gray-800 dark:text-white mb-2">{card.traditional}</div>
            <div className="text-xl text-purple-600 dark:text-purple-400">{card.pinyin}</div>
            <button
              onClick={() => PronunciationPlayer.speak(card.traditional, "zh-TW")}
              className="mt-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-white/60 transition"
            >
              🔊 Listen
            </button>
          </div>
        )}
      </div>

      {revealed && !selfScore && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSelf("learning")}
            className="bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600 transition"
          >
            ✗ Still Learning
          </button>
          <button
            onClick={() => handleSelf("know")}
            className="bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition"
          >
            ✓ I Got It
          </button>
        </div>
      )}
    </div>
  );
}

// ── Score Screen ──────────────────────────────────────────────────────────────
function ScoreScreen({
  score,
  total,
  skill,
  onRetry,
}: {
  score: number;
  total: number;
  skill: string;
  onRetry: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  return (
    <div className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 text-center shadow-xl">
      <div className="text-5xl mb-3">
        {pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "📚"}
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
        {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good effort!" : "Keep practicing!"}
      </h2>
      <p className="text-gray-500 dark:text-white/50 mb-4">
        {score}/{total} correct ({pct}%)
      </p>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
        >
          Practice Again
        </button>
        <Link
          href="/"
          className="flex-1 border-2 border-gray-300 dark:border-white/[0.1] text-gray-600 dark:text-white/70 py-3 rounded-xl font-bold text-center hover:bg-gray-50 dark:hover:bg-white/[0.08]"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LessonsPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = use(params);
  const meta = SKILL_META[skill] ?? SKILL_META.reading;
  const { theme, toggle } = useTheme();

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [selectedLevel, setSelectedLevel] = useState<HSKLevel>("A1");
  const [mode, setMode] = useState<SkillMode>("browse");
  const [exerciseVocab, setExerciseVocab] = useState<VocabEntry[]>([]);
  const [exerciseScore, setExerciseScore] = useState<number | null>(null);
  const [readingPassage, setReadingPassage] = useState<ReadingPassage | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<HSKLevel | null>(null);
  const [source, setSource] = useState<"tocfl" | "book">("tocfl");
  const [selectedUnit, setSelectedUnit] = useState(1);

  useEffect(() => {
    const stored = loadCompletedLessons();
    setCompleted(new Set(stored));
    saveLastActiveSkill(skill);
    const profile = loadUserProfile();
    if (profile.level) {
      setUserLevel(profile.level);
      setSelectedLevel(profile.level);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") === "book") {
      setSource("book");
      const unit = parseInt(params.get("unit") ?? "1", 10);
      if (unit >= 1 && unit <= 14) setSelectedUnit(unit);
    }
  }, [skill]);

  const levels = getAllLevels();
  const vocabForLevel = getVocabByLevel(selectedLevel);
  const completedInLevel = vocabForLevel.filter((v) =>
    completed.has(`${skill}-${v.id}`)
  ).length;

  const bookWords = getWordsByUnit(selectedUnit).map(bookWordToVocabEntry);
  const vocabPool = source === "book" ? bookWords : vocabForLevel;

  function startExercise() {
    setExerciseScore(null);
    if (skill === "reading") {
      const passage =
        source === "book"
          ? getPassageByUnit(selectedUnit)
          : getPassageByLevel(selectedLevel);
      setReadingPassage(passage ?? null);
    } else {
      const pool = shuffle(vocabPool).slice(0, 10);
      setExerciseVocab(pool);
    }
    setMode("exercise");
  }

  function handleExerciseDone(score: number) {
    setExerciseScore(score);
  }

  function handleRetry() {
    setMode("browse");
    setExerciseScore(null);
  }

  function playAudio(id: string, text: string) {
    if (playingId === id) {
      PronunciationPlayer.stopSpeaking();
      setPlayingId(null);
    } else {
      PronunciationPlayer.speak(text, "zh-TW");
      setPlayingId(id);
    }
  }

  const LEVEL_BADGE: Record<HSKLevel, string> = {
    A1: "bg-green-500",
    A2: "bg-teal-500",
    B1: "bg-blue-500",
    B2: "bg-purple-500",
    C1: "bg-orange-500",
    C2: "bg-red-500",
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur border-b border-gray-200 dark:border-white/[0.06] px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">← Home</Link>
        <h1 className="font-bold text-sm capitalize">{meta.icon} {skill}</h1>
        <button onClick={toggle} className="text-lg">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-3xl shrink-0`}
          >
            {meta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold capitalize">{skill}</h2>
            <p className="text-gray-500 dark:text-white/70">{meta.description}</p>
          </div>
          {skill === "listening" && (
            <Link
              href="/video-listening"
              className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.1] text-gray-700 dark:text-white px-4 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 shrink-0"
            >
              🎬 Video Lessons
            </Link>
          )}
        </div>

        {/* Source Toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setSource("tocfl"); setMode("browse"); setExerciseScore(null); }}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition ${source === "tocfl" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg" : "bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/[0.1]"}`}
          >
            📊 TOCFL Levels
          </button>
          <button
            onClick={() => { setSource("book"); setMode("browse"); setExerciseScore(null); }}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition ${source === "book" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg" : "bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/[0.1]"}`}
          >
            📖 時代華語 Book 1
          </button>
        </div>

        {source === "tocfl" ? (
          <>
            {/* Level Tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {levels.map((lvl) => {
                const lvlVocab = getVocabByLevel(lvl);
                const done = lvlVocab.filter((v) =>
                  completed.has(`${skill}-${v.id}`)
                ).length;
                return (
                  <button
                    key={lvl}
                    onClick={() => { setSelectedLevel(lvl); setMode("browse"); setExerciseScore(null); }}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                      selectedLevel === lvl
                        ? `${LEVEL_BADGE[lvl]} text-white shadow-lg`
                        : "bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/[0.1]"
                    }`}
                  >
                    {lvl}
                    {userLevel === lvl && " ★"}
                    {done > 0 && (
                      <span className="ml-1 text-xs opacity-80">({done}/{lvlVocab.length})</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Level Info */}
            <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${LEVEL_BADGE[selectedLevel]}`}>
                  {selectedLevel}
                </span>
                <span className="text-gray-600 dark:text-white/80 text-sm ml-3">
                  {LEVEL_DESCRIPTIONS[selectedLevel]}
                </span>
                <div className="text-gray-400 dark:text-white/60 text-xs mt-1">
                  {completedInLevel}/{vocabForLevel.length} practiced in {skill}
                </div>
              </div>
              {mode === "browse" && (
                <button onClick={startExercise} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-xl font-bold hover:opacity-90 transition text-sm">
                  🎯 Start {meta.exerciseLabel}
                </button>
              )}
              {mode === "exercise" && exerciseScore === null && (
                <button onClick={() => setMode("browse")} className="bg-gray-100 dark:bg-white/[0.1] text-gray-700 dark:text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-white/[0.15] transition">
                  ← Back to Browse
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Unit Tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {SHIDAI_UNITS.map((u) => {
                const done = getWordsByUnit(u.unit).filter((w) =>
                  completed.has(`${skill}-book-${w.id}`)
                ).length;
                return (
                  <button
                    key={u.unit}
                    onClick={() => { setSelectedUnit(u.unit); setMode("browse"); setExerciseScore(null); }}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                      selectedUnit === u.unit
                        ? "bg-yellow-400 text-gray-900 shadow-lg"
                        : "bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/[0.1]"
                    }`}
                  >
                    L{u.unit}
                    {done > 0 && (
                      <span className="ml-1 text-xs opacity-80">({done}/{getWordsByUnit(u.unit).length})</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Unit Info */}
            <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-yellow-500">
                  Lesson {selectedUnit}
                </span>
                <span className="text-gray-600 dark:text-white/80 text-sm ml-3">
                  {SHIDAI_UNITS.find((u) => u.unit === selectedUnit)?.titleZh} — {SHIDAI_UNITS.find((u) => u.unit === selectedUnit)?.titleEn}
                </span>
                <div className="text-gray-400 dark:text-white/60 text-xs mt-1">
                  {bookWords.length} words in this lesson
                </div>
              </div>
              {mode === "browse" && bookWords.length >= 4 && (
                <button onClick={startExercise} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-xl font-bold hover:opacity-90 transition text-sm">
                  🎯 Start {meta.exerciseLabel}
                </button>
              )}
              {mode === "exercise" && exerciseScore === null && (
                <button onClick={() => setMode("browse")} className="bg-gray-100 dark:bg-white/[0.1] text-gray-700 dark:text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-white/[0.15] transition">
                  ← Back to Browse
                </button>
              )}
            </div>
          </>
        )}

        {/* Content */}
        {mode === "browse" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vocabPool.map((vocab) => {
              const isDone = completed.has(`${skill}-${vocab.id}`);
              return (
                <div
                  key={vocab.id}
                  className={`bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-lg hover:shadow-xl transition ${
                    isDone ? "ring-2 ring-green-400" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        source === "book"
                          ? "bg-yellow-100 text-yellow-800"
                          : LEVEL_COLORS[vocab.level]
                      }`}
                    >
                      {source === "book" ? `L${selectedUnit}` : vocab.level}
                    </span>
                    {isDone && (
                      <span className="text-green-500 font-bold text-xs">✓ Done</span>
                    )}
                  </div>
                  <div className="text-4xl font-bold text-gray-800 dark:text-white mb-1">
                    {vocab.traditional}
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 font-medium mb-1">{vocab.pinyin}</div>
                  <div className="text-gray-600 dark:text-white/70 text-sm mb-2">{vocab.meaning}</div>
                  <div className="text-xs text-gray-400 dark:text-white/40 italic capitalize mb-3">
                    {vocab.partOfSpeech}
                  </div>
                  {vocab.example && (
                    <div className="bg-gray-50 dark:bg-white/[0.03] rounded-lg p-2 text-xs text-gray-600 dark:text-white/60 mb-3">
                      <p>{vocab.example}</p>
                      <p className="text-gray-400 dark:text-white/40 mt-0.5">{vocab.exampleTranslation}</p>
                    </div>
                  )}
                  <button
                    onClick={() => playAudio(vocab.id, vocab.traditional)}
                    className={`w-full py-1.5 rounded-lg text-sm font-medium transition ${
                      playingId === vocab.id
                        ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300"
                        : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                    }`}
                  >
                    {playingId === vocab.id ? "⏹ Stop" : "🔊 Listen"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : exerciseScore !== null ? (
          <ScoreScreen
            score={exerciseScore}
            total={skill === "reading" && readingPassage ? readingPassage.questions.length : exerciseVocab.length}
            skill={skill}
            onRetry={handleRetry}
          />
        ) : skill === "reading" ? (
          readingPassage ? (
            <ReadingExercise
              passage={readingPassage}
              skill={skill}
              onComplete={handleExerciseDone}
            />
          ) : (
            <div className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 text-center shadow-xl">
              <p className="text-gray-500 dark:text-white/50">No reading passage available for this selection.</p>
              <button onClick={() => setMode("browse")} className="mt-4 text-blue-600 dark:text-blue-400 underline">Back to Browse</button>
            </div>
          )
        ) : skill === "listening" ? (
          <ListeningExercise
            vocab={exerciseVocab}
            skill={skill}
            onComplete={handleExerciseDone}
          />
        ) : skill === "speaking" ? (
          <SpeakingExercise
            vocab={exerciseVocab}
            skill={skill}
            onComplete={handleExerciseDone}
          />
        ) : (
          <WritingExercise
            vocab={exerciseVocab}
            skill={skill}
            onComplete={handleExerciseDone}
          />
        )}
      </div>
    </main>
  );
}
