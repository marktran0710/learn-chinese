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

// Converts a BookWord to a VocabEntry shape for reuse in exercise components
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

// ── Reading Exercise: show character → pick meaning ──────────────────────────
function ReadingExercise({
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

  const card = vocab[idx];

  useEffect(() => {
    setOptions(buildOptions(card, vocab));
  }, [idx, card, vocab]);

  function handlePick(picked: VocabEntry) {
    if (selected) return;
    setSelected(picked.id);
    const correct = picked.id === card.id;
    if (correct) {
      setScore((s) => s + 1);
      reviewCard(card.id, 4);
    } else {
      reviewCard(card.id, 1);
    }
    addCompletedLesson(`${skill}-${card.id}`);
    addXP(correct ? 10 : 3);
    setTimeout(() => {
      if (idx + 1 >= vocab.length) {
        onComplete(score + (correct ? 1 : 0));
      } else {
        setIdx((i) => i + 1);
        setSelected(null);
      }
    }, 800);
  }

  return (
    <div>
      <p className="text-sm text-white/70 mb-3">
        Question {idx + 1} / {vocab.length} — What does this mean?
      </p>
      <div className="bg-white rounded-2xl p-8 text-center mb-4 shadow-xl">
        <div className="text-7xl font-bold text-gray-800 mb-3">{card.traditional}</div>
        <div className="text-xl text-purple-600">{card.pinyin}</div>
        <button
          onClick={() => PronunciationPlayer.speak(card.traditional, "zh-TW")}
          className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition"
        >
          🔊 Hear pronunciation
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          let cls = "p-4 rounded-xl font-medium text-left border-2 transition ";
          if (!selected) {
            cls += "bg-white border-white hover:border-blue-400 hover:bg-blue-50 text-gray-800";
          } else if (opt.id === card.id) {
            cls += "bg-green-100 border-green-500 text-green-800";
          } else if (opt.id === selected) {
            cls += "bg-red-100 border-red-400 text-red-700";
          } else {
            cls += "bg-white/50 border-white/30 text-gray-400";
          }
          return (
            <button key={opt.id} onClick={() => handlePick(opt)} className={cls}>
              {opt.meaning}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Listening Exercise: hear audio → pick character ──────────────────────────
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
      <p className="text-sm text-white/70 mb-3">
        Question {idx + 1} / {vocab.length} — Listen and choose the correct character
      </p>
      <div className="bg-white rounded-2xl p-8 text-center mb-4 shadow-xl">
        <button
          onClick={playAudio}
          className={`w-24 h-24 rounded-full text-4xl font-bold transition ${
            played
              ? "bg-blue-100 text-blue-600"
              : "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:opacity-90 animate-pulse"
          }`}
        >
          🔊
        </button>
        <p className="text-gray-400 mt-3 text-sm">
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
              ? "bg-white border-white hover:border-blue-400 hover:bg-blue-50 text-gray-800"
              : "bg-white/30 border-white/20 text-white/50 cursor-not-allowed";
          } else if (opt.id === card.id) {
            cls += "bg-green-100 border-green-500 text-green-800";
          } else if (opt.id === selected) {
            cls += "bg-red-100 border-red-400 text-red-700";
          } else {
            cls += "bg-white/50 border-white/30 text-gray-400";
          }
          return (
            <button key={opt.id} onClick={() => handlePick(opt)} className={cls}>
              <div>{opt.traditional}</div>
              <div className="text-sm font-normal text-gray-400">{opt.pinyin}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Speaking Exercise: see word → tap to practice speaking ───────────────────
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
      <p className="text-sm text-white/70 mb-3">
        Card {idx + 1} / {vocab.length} — Practice saying this word aloud
      </p>
      <div className="bg-white rounded-2xl p-8 text-center mb-4 shadow-xl">
        <div className="text-7xl font-bold text-gray-800 mb-2">{card.traditional}</div>
        <div className="text-gray-400 text-sm mb-2">{card.meaning}</div>
        <button
          onClick={() => setShowPinyin(!showPinyin)}
          className="text-xs text-blue-400 hover:text-blue-600 mb-4 transition"
        >
          {showPinyin ? `📌 ${card.pinyin}` : "Show pinyin"}
        </button>
        {card.example && (
          <div className="bg-gray-50 rounded-xl p-3 text-left mt-2">
            <p className="text-gray-700 text-sm">{card.example}</p>
            <p className="text-gray-400 text-xs mt-1">{card.exampleTranslation}</p>
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

// ── Writing Exercise: show meaning → recall character ────────────────────────
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
      <p className="text-sm text-white/70 mb-3">
        Card {idx + 1} / {vocab.length} — Can you write this character?
      </p>
      <div className="bg-white rounded-2xl p-8 text-center mb-4 shadow-xl">
        <p className="text-gray-500 text-sm mb-2">Meaning:</p>
        <div className="text-3xl font-bold text-gray-800 mb-2">{card.meaning}</div>
        <div className="text-gray-400 text-sm italic capitalize mb-4">
          ({card.partOfSpeech})
        </div>

        {!revealed ? (
          <button
            onClick={handleReveal}
            className="bg-purple-100 text-purple-700 px-6 py-3 rounded-xl font-medium hover:bg-purple-200 transition"
          >
            Reveal Character →
          </button>
        ) : (
          <div>
            <div className="text-7xl font-bold text-gray-800 mb-2">{card.traditional}</div>
            <div className="text-xl text-purple-600">{card.pinyin}</div>
            <button
              onClick={() => PronunciationPlayer.speak(card.traditional, "zh-TW")}
              className="mt-2 text-sm text-gray-400 hover:text-gray-600 transition"
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
    <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
      <div className="text-5xl mb-3">
        {pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "📚"}
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good effort!" : "Keep practicing!"}
      </h2>
      <p className="text-gray-500 mb-4">
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
          className="flex-1 border-2 border-gray-300 text-gray-600 py-3 rounded-xl font-bold text-center hover:bg-gray-50"
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

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [selectedLevel, setSelectedLevel] = useState<HSKLevel>("A1");
  const [mode, setMode] = useState<SkillMode>("browse");
  const [exerciseVocab, setExerciseVocab] = useState<VocabEntry[]>([]);
  const [exerciseScore, setExerciseScore] = useState<number | null>(null);
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
    // Read URL params for deep-link from home page
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
    const pool = shuffle(vocabPool).slice(0, 10);
    setExerciseVocab(pool);
    setExerciseScore(null);
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
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/" className="text-white hover:text-gray-200 mb-6 inline-block">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-3xl`}
          >
            {meta.icon}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white capitalize">{skill}</h1>
            <p className="text-white/70">{meta.description}</p>
          </div>
        </div>

        {/* Source Toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setSource("tocfl"); setMode("browse"); setExerciseScore(null); }}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition ${source === "tocfl" ? "bg-white text-gray-800 shadow-lg" : "bg-white/20 text-white hover:bg-white/30"}`}
          >
            📊 TOCFL Levels
          </button>
          <button
            onClick={() => { setSource("book"); setMode("browse"); setExerciseScore(null); }}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition ${source === "book" ? "bg-white text-gray-800 shadow-lg" : "bg-white/20 text-white hover:bg-white/30"}`}
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
                        : "bg-white/20 text-white hover:bg-white/30"
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
            <div className="bg-white/15 backdrop-blur rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${LEVEL_BADGE[selectedLevel]}`}>
                  {selectedLevel}
                </span>
                <span className="text-white/80 text-sm ml-3">
                  {LEVEL_DESCRIPTIONS[selectedLevel]}
                </span>
                <div className="text-white/60 text-xs mt-1">
                  {completedInLevel}/{vocabForLevel.length} practiced in {skill}
                </div>
              </div>
              {mode === "browse" && (
                <button onClick={startExercise} className="bg-white text-gray-800 px-5 py-2 rounded-xl font-bold hover:bg-gray-100 transition text-sm">
                  🎯 Start {meta.exerciseLabel}
                </button>
              )}
              {mode === "exercise" && exerciseScore === null && (
                <button onClick={() => setMode("browse")} className="bg-white/30 text-white px-4 py-2 rounded-xl text-sm hover:bg-white/40 transition">
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
                        : "bg-white/20 text-white hover:bg-white/30"
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
            <div className="bg-white/15 backdrop-blur rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-yellow-500">
                  Lesson {selectedUnit}
                </span>
                <span className="text-white/80 text-sm ml-3">
                  {SHIDAI_UNITS.find((u) => u.unit === selectedUnit)?.titleZh} — {SHIDAI_UNITS.find((u) => u.unit === selectedUnit)?.titleEn}
                </span>
                <div className="text-white/60 text-xs mt-1">
                  {bookWords.length} words in this lesson
                </div>
              </div>
              {mode === "browse" && bookWords.length >= 4 && (
                <button onClick={startExercise} className="bg-white text-gray-800 px-5 py-2 rounded-xl font-bold hover:bg-gray-100 transition text-sm">
                  🎯 Start {meta.exerciseLabel}
                </button>
              )}
              {mode === "exercise" && exerciseScore === null && (
                <button onClick={() => setMode("browse")} className="bg-white/30 text-white px-4 py-2 rounded-xl text-sm hover:bg-white/40 transition">
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
                  className={`bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition ${
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
                  <div className="text-4xl font-bold text-gray-800 mb-1">
                    {vocab.traditional}
                  </div>
                  <div className="text-purple-600 font-medium mb-1">{vocab.pinyin}</div>
                  <div className="text-gray-600 text-sm mb-2">{vocab.meaning}</div>
                  <div className="text-xs text-gray-400 italic capitalize mb-3">
                    {vocab.partOfSpeech}
                  </div>
                  {vocab.example && (
                    <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 mb-3">
                      <p>{vocab.example}</p>
                      <p className="text-gray-400 mt-0.5">{vocab.exampleTranslation}</p>
                    </div>
                  )}
                  <button
                    onClick={() => playAudio(vocab.id, vocab.traditional)}
                    className={`w-full py-1.5 rounded-lg text-sm font-medium transition ${
                      playingId === vocab.id
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
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
            total={exerciseVocab.length}
            skill={skill}
            onRetry={handleRetry}
          />
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
        ) : skill === "writing" ? (
          <WritingExercise
            vocab={exerciseVocab}
            skill={skill}
            onComplete={handleExerciseDone}
          />
        ) : (
          <ReadingExercise
            vocab={exerciseVocab}
            skill={skill}
            onComplete={handleExerciseDone}
          />
        )}
      </div>
    </main>
  );
}
