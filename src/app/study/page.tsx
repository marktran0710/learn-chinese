"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  TOCFL_VOCAB,
  getVocabByLevel,
  getAllLevels,
  LEVEL_DESCRIPTIONS,
} from "@/data/vocabulary";
import type { VocabEntry, HSKLevel } from "@/data/vocabulary";
import {
  loadUserProfile,
  loadSRSCards,
  reviewCard,
  getDueCards,
  addXP,
} from "@/lib/storage";
import { PronunciationPlayer } from "@/lib/pronunciation";

type StudyMode = "flashcard" | "quiz" | "review";
type FlipState = "front" | "back";

const LEVEL_COLORS: Record<HSKLevel, string> = {
  A1: "from-green-400 to-green-600",
  A2: "from-teal-400 to-teal-600",
  B1: "from-blue-400 to-blue-600",
  B2: "from-purple-400 to-purple-600",
  C1: "from-orange-400 to-red-500",
  C2: "from-red-500 to-pink-600",
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuizOptions(correct: VocabEntry, pool: VocabEntry[]): string[] {
  const distractors = shuffle(pool.filter((v) => v.id !== correct.id))
    .slice(0, 3)
    .map((v) => v.meaning);
  return shuffle([correct.meaning, ...distractors]);
}

// ── Flashcard Component ──────────────────────────────────────────────────────
function FlashcardView({
  cards,
  onDone,
}: {
  cards: VocabEntry[];
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState<FlipState>("front");
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);

  const card = cards[idx];

  function handleFlip() {
    setFlip((f) => (f === "front" ? "back" : "front"));
  }

  function handleKnow(grade: 4 | 1) {
    reviewCard(card.id, grade);
    if (grade === 4) {
      setKnown((k) => k + 1);
      addXP(5);
    } else {
      setUnknown((u) => u + 1);
    }
    if (idx + 1 >= cards.length) {
      onDone();
    } else {
      setIdx((i) => i + 1);
      setFlip("front");
    }
  }

  function playAudio() {
    PronunciationPlayer.speak(card.traditional, "zh-TW");
  }

  const progress = ((idx + 1) / cards.length) * 100;

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-white text-sm font-medium">
          {idx + 1}/{cards.length}
        </span>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4 text-sm">
        <span className="bg-green-500 text-white px-3 py-1 rounded-full">
          ✓ {known} known
        </span>
        <span className="bg-red-400 text-white px-3 py-1 rounded-full">
          ✗ {unknown} learning
        </span>
      </div>

      {/* Card */}
      <div
        onClick={handleFlip}
        className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer min-h-64 flex flex-col items-center justify-center text-center mb-4 select-none transition-all hover:shadow-3xl"
      >
        {flip === "front" ? (
          <>
            <div
              className={`text-xs font-bold mb-4 bg-gradient-to-r ${LEVEL_COLORS[card.level]} text-white px-3 py-1 rounded-full`}
            >
              {card.level}
            </div>
            <div className="text-7xl font-bold text-gray-800 mb-3">
              {card.traditional}
            </div>
            <div className="text-2xl text-purple-600 font-medium">
              {card.pinyin}
            </div>
            <p className="text-gray-400 text-sm mt-6">Tap to reveal meaning →</p>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {card.traditional}
            </div>
            <div className="text-lg text-purple-600 mb-2">{card.pinyin}</div>
            <div className="text-2xl font-semibold text-gray-700 mb-3">
              {card.meaning}
            </div>
            <span className="text-sm text-gray-400 italic capitalize">
              {card.partOfSpeech}
            </span>
            {card.example && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4 text-left w-full">
                <p className="text-gray-800 font-medium text-sm">{card.example}</p>
                <p className="text-gray-500 text-xs mt-1">{card.exampleTranslation}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Audio */}
      <div className="flex justify-center mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            playAudio();
          }}
          className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition text-sm"
        >
          🔊 Pronunciation
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleKnow(1)}
          className="bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition"
        >
          ✗ Still Learning
        </button>
        <button
          onClick={() => handleKnow(4)}
          className="bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition"
        >
          ✓ I Know This
        </button>
      </div>
    </div>
  );
}

// ── Quiz Component ────────────────────────────────────────────────────────────
function QuizView({
  cards,
  pool,
  onDone,
}: {
  cards: VocabEntry[];
  pool: VocabEntry[];
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const card = cards[idx];

  const refreshOptions = useCallback(() => {
    setOptions(buildQuizOptions(card, pool));
  }, [card, pool]);

  useEffect(() => {
    refreshOptions();
  }, [refreshOptions]);

  function handleSelect(i: number) {
    if (showFeedback) return;
    setSelected(i);
    setShowFeedback(true);
    if (options[i] === card.meaning) {
      setScore((s) => s + 1);
      reviewCard(card.id, 4);
      addXP(8);
    } else {
      reviewCard(card.id, 1);
    }
  }

  function handleNext() {
    setSelected(null);
    setShowFeedback(false);
    if (idx + 1 >= cards.length) {
      onDone();
    } else {
      setIdx((i) => i + 1);
    }
  }

  const progress = ((idx + 1) / cards.length) * 100;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-white text-sm">{idx + 1}/{cards.length}</span>
        <span className="text-green-300 text-sm font-bold">Score: {score}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-4">
        <p className="text-gray-500 text-sm mb-2">What does this mean?</p>
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-gray-800 mb-2">
            {card.traditional}
          </div>
          <div className="text-xl text-purple-600">{card.pinyin}</div>
        </div>

        <div className="space-y-3">
          {options.map((opt, i) => {
            let cls =
              "w-full p-4 rounded-xl border-2 text-left font-medium transition ";
            if (!showFeedback) {
              cls +=
                selected === i
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50";
            } else {
              if (opt === card.meaning) cls += "border-green-500 bg-green-50 text-green-800";
              else if (i === selected) cls += "border-red-400 bg-red-50 text-red-700";
              else cls += "border-gray-100 text-gray-400";
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} className={cls}>
                {opt}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="mt-4">
            {card.example && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <p className="font-medium text-gray-700">{card.example}</p>
                <p className="text-gray-500 mt-1">{card.exampleTranslation}</p>
              </div>
            )}
            <button
              onClick={handleNext}
              className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
            >
              {idx + 1 >= cards.length ? "See Results →" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Done Screen ───────────────────────────────────────────────────────────────
function DoneScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Complete!</h2>
      <p className="text-gray-500 mb-6">Great work. Your progress has been saved.</p>
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90"
        >
          Study Again
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
export default function StudyPage() {
  const [mode, setMode] = useState<StudyMode | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<HSKLevel | "due" | "all">("all");
  const [studyCards, setStudyCards] = useState<VocabEntry[] | null>(null);
  const [done, setDone] = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const [userLevel, setUserLevel] = useState<HSKLevel | null>(null);

  useEffect(() => {
    const profile = loadUserProfile();
    setUserLevel(profile.level);
    const due = getDueCards();
    setDueCount(due.length);
  }, []);

  function startStudy() {
    let pool: VocabEntry[] = [];
    if (selectedLevel === "due") {
      const dueIds = new Set(getDueCards());
      pool = TOCFL_VOCAB.filter((v) => dueIds.has(v.id));
      if (pool.length === 0) pool = shuffle(TOCFL_VOCAB).slice(0, 20);
    } else if (selectedLevel === "all") {
      pool = shuffle(TOCFL_VOCAB).slice(0, 20);
    } else {
      pool = shuffle(getVocabByLevel(selectedLevel)).slice(0, 20);
    }
    setStudyCards(shuffle(pool));
    setDone(false);
  }

  function handleRestart() {
    setStudyCards(null);
    setDone(false);
    setMode(null);
  }

  const levels = getAllLevels();

  // Selecting mode and level
  if (!mode || !studyCards) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-white hover:text-gray-200 mb-6 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">📚 Study</h1>
          <p className="text-white/70 mb-8">Choose your level and study mode</p>

          {/* Level Selector */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-gray-700 mb-4">Select Level</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <button
                onClick={() => setSelectedLevel("due")}
                className={`p-3 rounded-xl border-2 text-sm font-bold transition ${
                  selectedLevel === "due"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                🔔 Due ({dueCount})
              </button>
              <button
                onClick={() => setSelectedLevel("all")}
                className={`p-3 rounded-xl border-2 text-sm font-bold transition ${
                  selectedLevel === "all"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                📖 All
              </button>
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition ${
                    selectedLevel === lvl
                      ? `border-transparent text-white bg-gradient-to-r ${LEVEL_COLORS[lvl]}`
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {lvl}
                  {userLevel === lvl && " ★"}
                </button>
              ))}
            </div>
            {selectedLevel !== "due" && selectedLevel !== "all" && (
              <p className="text-gray-500 text-sm">
                {LEVEL_DESCRIPTIONS[selectedLevel as HSKLevel]}
              </p>
            )}
          </div>

          {/* Mode Selector */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-gray-700 mb-4">Study Mode</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setMode("flashcard")}
                className={`p-5 rounded-xl border-2 text-left transition ${
                  mode === "flashcard"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="text-3xl mb-2">🃏</div>
                <div className="font-bold text-gray-800">Flashcards</div>
                <div className="text-gray-500 text-sm">
                  Flip cards, mark known or still learning
                </div>
              </button>
              <button
                onClick={() => setMode("quiz")}
                className={`p-5 rounded-xl border-2 text-left transition ${
                  mode === "quiz"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="text-3xl mb-2">📝</div>
                <div className="font-bold text-gray-800">Multiple Choice Quiz</div>
                <div className="text-gray-500 text-sm">
                  Test yourself with 4-option questions
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={startStudy}
            disabled={!mode}
            className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {mode ? `Start ${mode === "flashcard" ? "Flashcards" : "Quiz"} →` : "Select a mode above"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleRestart}
          className="text-white hover:text-gray-200 mb-6 inline-block"
        >
          ← Change Settings
        </button>

        {done ? (
          <DoneScreen onRestart={handleRestart} />
        ) : mode === "flashcard" ? (
          <FlashcardView
            cards={studyCards}
            onDone={() => setDone(true)}
          />
        ) : (
          <QuizView
            cards={studyCards}
            pool={
              selectedLevel === "all" || selectedLevel === "due"
                ? TOCFL_VOCAB
                : getVocabByLevel(selectedLevel as HSKLevel)
            }
            onDone={() => setDone(true)}
          />
        )}
      </div>
    </main>
  );
}
