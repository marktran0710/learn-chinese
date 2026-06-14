"use client";

import Link from "next/link";
import { useState } from "react";
import { saveUserProfile, loadUserProfile } from "@/lib/storage";
import type { HSKLevel } from "@/data/vocabulary";
import { LEVEL_CAREERS, LEVEL_DESCRIPTIONS } from "@/data/vocabulary";
import { useTheme } from "@/lib/theme";

type Question = {
  id: number;
  level: HSKLevel;
  type: "meaning" | "character" | "usage";
  prompt: string;
  options: string[];
  correct: number;
};

const QUESTIONS: Question[] = [
  // A1
  {
    id: 1,
    level: "A1",
    type: "meaning",
    prompt: "What does 謝謝 (xiè xiè) mean?",
    options: ["Hello", "Thank you", "Goodbye", "Sorry"],
    correct: 1,
  },
  {
    id: 2,
    level: "A1",
    type: "character",
    prompt: "Which character means 'water'?",
    options: ["火", "水", "土", "木"],
    correct: 1,
  },
  {
    id: 3,
    level: "A1",
    type: "meaning",
    prompt: "What does 朋友 (péng yǒu) mean?",
    options: ["Family", "Teacher", "Friend", "Student"],
    correct: 2,
  },
  {
    id: 4,
    level: "A1",
    type: "usage",
    prompt: "Fill in the blank: 我 ___ 台灣人。(I am Taiwanese.)",
    options: ["不", "是", "有", "去"],
    correct: 1,
  },
  // A2
  {
    id: 5,
    level: "A2",
    type: "meaning",
    prompt: "What does 餐廳 (cān tīng) mean?",
    options: ["Supermarket", "Hospital", "Restaurant", "School"],
    correct: 2,
  },
  {
    id: 6,
    level: "A2",
    type: "character",
    prompt: "Which word means 'weather'?",
    options: ["時間", "天氣", "運動", "顏色"],
    correct: 1,
  },
  {
    id: 7,
    level: "A2",
    type: "usage",
    prompt: "Choose the correct conjunction: 我想去，___ 我很忙。(I want to go, but I'm busy.)",
    options: ["因為", "所以", "但是", "如果"],
    correct: 2,
  },
  {
    id: 8,
    level: "A2",
    type: "meaning",
    prompt: "What does 高興 (gāo xìng) mean?",
    options: ["Angry", "Sad", "Happy", "Tired"],
    correct: 2,
  },
  // B1
  {
    id: 9,
    level: "B1",
    type: "meaning",
    prompt: "What does 溝通 (gōu tōng) mean?",
    options: ["Transportation", "Communication", "Education", "Tradition"],
    correct: 1,
  },
  {
    id: 10,
    level: "B1",
    type: "character",
    prompt: "Which word means 'responsibility'?",
    options: ["機會", "目標", "責任", "態度"],
    correct: 2,
  },
  {
    id: 11,
    level: "B1",
    type: "usage",
    prompt: "Choose the correct word: 她非常___地學習。(She studies very diligently.)",
    options: ["解決", "努力", "進步", "認為"],
    correct: 1,
  },
  {
    id: 12,
    level: "B1",
    type: "meaning",
    prompt: "What does 傳統 (chuán tǒng) mean?",
    options: ["Culture", "Society", "Tradition", "Progress"],
    correct: 2,
  },
  // B2
  {
    id: 13,
    level: "B2",
    type: "meaning",
    prompt: "What does 永續 (yǒng xù) mean?",
    options: ["Permanent", "Sustainable", "Continuous", "Stable"],
    correct: 1,
  },
  {
    id: 14,
    level: "B2",
    type: "character",
    prompt: "Which word means 'globalization'?",
    options: ["民主化", "現代化", "全球化", "多元化"],
    correct: 2,
  },
  {
    id: 15,
    level: "B2",
    type: "usage",
    prompt: "Choose the correct word: 公司需要新的行銷___。(The company needs a new marketing ___。)",
    options: ["態度", "策略", "方法", "計畫"],
    correct: 1,
  },
  {
    id: 16,
    level: "B2",
    type: "meaning",
    prompt: "What does 辯論 (biàn lùn) mean?",
    options: ["Discussion", "Agreement", "Debate", "Negotiation"],
    correct: 2,
  },
  // C1
  {
    id: 17,
    level: "C1",
    type: "meaning",
    prompt: "What does 範疇 (fàn chóu) mean?",
    options: ["Standard", "Category/Scope", "Regulation", "Boundary"],
    correct: 1,
  },
  {
    id: 18,
    level: "C1",
    type: "meaning",
    prompt: "What does 縝密 (zhěn mì) mean?",
    options: ["Innovative", "Meticulous", "Profound", "Flexible"],
    correct: 1,
  },
  // C2
  {
    id: 19,
    level: "C2",
    type: "meaning",
    prompt: "What does the idiom 篳路藍縷 (bì lù lán lǚ) describe?",
    options: [
      "Extreme extravagance",
      "Working under difficult conditions with pioneering spirit",
      "Being overly cautious",
      "A paradoxical situation",
    ],
    correct: 1,
  },
  {
    id: 20,
    level: "C2",
    type: "meaning",
    prompt: "What does 斡旋 (wò xuán) mean?",
    options: ["To negotiate/mediate", "To investigate", "To criticize", "To elaborate"],
    correct: 0,
  },
];

function scoreToLevel(score: number): HSKLevel {
  if (score <= 3) return "A1";
  if (score <= 6) return "A2";
  if (score <= 10) return "B1";
  if (score <= 14) return "B2";
  if (score <= 17) return "C1";
  return "C2";
}

const LEVEL_COLORS: Record<HSKLevel, string> = {
  A1: "from-green-400 to-green-600",
  A2: "from-teal-400 to-teal-600",
  B1: "from-blue-400 to-blue-600",
  B2: "from-purple-400 to-purple-600",
  C1: "from-orange-400 to-red-500",
  C2: "from-red-500 to-pink-600",
};

export default function PretestPage() {
  const { theme, toggle } = useTheme();
  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [name, setName] = useState("");

  const question = QUESTIONS[current];
  const score = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
  const level = scoreToLevel(score);

  function handleAnswer(optionIdx: number) {
    if (showFeedback) return;
    setSelected(optionIdx);
    setShowFeedback(true);
  }

  function handleNext() {
    const updated = [...answers, selected ?? -1];
    setAnswers(updated);
    setSelected(null);
    setShowFeedback(false);
    if (current + 1 >= QUESTIONS.length) {
      const finalScore = updated.filter((a, i) => a === QUESTIONS[i].correct).length;
      const finalLevel = scoreToLevel(finalScore);
      const profile = loadUserProfile();
      saveUserProfile({
        ...profile,
        name: name || profile.name,
        level: finalLevel,
        pretestScore: finalScore,
        pretestDate: new Date().toISOString(),
      });
      setStep("result");
    } else {
      setCurrent((c) => c + 1);
    }
  }

  if (step === "intro") {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">← Home</Link>
            <button onClick={toggle} className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</button>
          </div>
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">TOCFL Placement Test</h1>
            <p className="text-gray-600 dark:text-white/60 mb-6">
              Answer 20 questions across all TOCFL levels (A1–C2). We'll determine
              your current level and recommend suitable career paths for you.
            </p>
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 mb-6 text-left">
              <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">What to expect:</p>
              <ul className="text-blue-700 dark:text-blue-300/80 space-y-1 text-sm">
                <li>📝 20 multiple-choice questions</li>
                <li>📈 Questions progress A1 → C2</li>
                <li>🏆 Instant level placement</li>
                <li>💼 Career recommendations</li>
                <li>⏱️ No time limit — take your time</li>
              </ul>
            </div>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.06] border border-gray-300 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 rounded-lg px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={() => setStep("quiz")}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:opacity-90 transition"
            >
              Start Test →
            </button>
            <Link href="/" className="block mt-4 text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (step === "result") {
    const finalScore = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
    const finalLevel = scoreToLevel(finalScore);
    const percent = Math.round((finalScore / QUESTIONS.length) * 100);
    const careers = LEVEL_CAREERS[finalLevel];

    return (
      <main className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">← Home</Link>
            <button onClick={toggle} className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</button>
          </div>
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🏆</div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                {name ? `Great job, ${name}!` : "Test Complete!"}
              </h1>
              <p className="text-gray-500 dark:text-white/50">
                You scored {finalScore}/{QUESTIONS.length} ({percent}%)
              </p>
            </div>

            {/* Level Badge */}
            <div
              className={`bg-gradient-to-r ${LEVEL_COLORS[finalLevel]} text-white rounded-2xl p-6 text-center mb-6`}
            >
              <div className="text-4xl font-black mb-1">{finalLevel}</div>
              <div className="text-lg font-semibold opacity-90">
                {finalLevel === "A1" && "入門級 Survival"}
                {finalLevel === "A2" && "基礎級 Elementary"}
                {finalLevel === "B1" && "進階級 Intermediate"}
                {finalLevel === "B2" && "高階級 Upper-Intermediate"}
                {finalLevel === "C1" && "流利級 Advanced"}
                {finalLevel === "C2" && "精通級 Mastery"}
              </div>
              <p className="text-sm opacity-80 mt-2">{LEVEL_DESCRIPTIONS[finalLevel]}</p>
            </div>

            {/* Score breakdown by level */}
            <div className="mb-6">
              <h2 className="font-bold text-gray-700 dark:text-white/80 mb-3">Score by Level</h2>
              {(["A1", "A2", "B1", "B2", "C1", "C2"] as HSKLevel[]).map((lvl) => {
                const qs = QUESTIONS.filter((q) => q.level === lvl);
                const correct = qs.filter((q) => answers[q.id - 1] === q.correct).length;
                const pct = qs.length ? Math.round((correct / qs.length) * 100) : 0;
                return (
                  <div key={lvl} className="flex items-center gap-3 mb-2">
                    <span className="w-8 font-bold text-gray-600 dark:text-white/70 text-sm">{lvl}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-white/[0.08] rounded-full h-3">
                      <div
                        className={`bg-gradient-to-r ${LEVEL_COLORS[lvl]} h-3 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-white/50 w-14 text-right">
                      {correct}/{qs.length}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Career Recommendations */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-4 mb-6">
              <h2 className="font-bold text-amber-800 dark:text-amber-300 mb-2">💼 Suitable Careers</h2>
              <ul className="space-y-1">
                {careers.map((c) => (
                  <li key={c} className="text-amber-700 dark:text-amber-300/80 text-sm flex items-center gap-2">
                    <span>✦</span> {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Link
                href="/study"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold text-center hover:opacity-90 transition"
              >
                Start Studying →
              </Link>
              <Link
                href="/"
                className="flex-1 border-2 border-gray-300 dark:border-white/[0.1] text-gray-600 dark:text-white/70 py-3 rounded-xl font-bold text-center hover:bg-gray-50 dark:hover:bg-white/[0.08] transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Quiz step
  const progress = ((current + 1) / QUESTIONS.length) * 100;
  const isCorrect = selected === question.correct;

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">← Home</Link>
          <button onClick={toggle} className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</button>
        </div>
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 dark:text-white/50 font-medium">
              Question {current + 1} / {QUESTIONS.length}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r ${LEVEL_COLORS[question.level]}`}
            >
              {question.level}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 dark:bg-white/[0.08] rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question */}
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{question.prompt}</h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, i) => {
              let classes =
                "w-full p-4 rounded-xl border-2 text-left font-medium transition ";
              if (!showFeedback) {
                classes +=
                  selected === i
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300"
                    : "border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-white hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-white/[0.08]";
              } else {
                if (i === question.correct) {
                  classes += "border-green-500 bg-green-50 dark:bg-green-500/20 text-green-800 dark:text-green-300";
                } else if (i === selected && i !== question.correct) {
                  classes += "border-red-400 bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300";
                } else {
                  classes += "border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-white/30";
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className={classes}
                >
                  <span className="mr-3 font-bold text-gray-400 dark:text-white/40">
                    {["A", "B", "C", "D"][i]}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`p-4 rounded-xl mb-4 ${
                isCorrect
                  ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-800 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-300"
              }`}
            >
              <p className="font-semibold mb-1">
                {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
              </p>
              {!isCorrect && (
                <p className="text-sm">
                  The correct answer is: <strong>{question.options[question.correct]}</strong>
                </p>
              )}
            </div>
          )}

          <button
            onClick={showFeedback ? handleNext : () => selected !== null && handleAnswer(selected)}
            disabled={selected === null && !showFeedback}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {showFeedback
              ? current + 1 >= QUESTIONS.length
                ? "See Results →"
                : "Next Question →"
              : "Check Answer"}
          </button>
        </div>
      </div>
    </main>
  );
}
