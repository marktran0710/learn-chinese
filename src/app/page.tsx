"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadCompletedLessons,
  loadCustomWords,
  loadLastActiveSkill,
  loadUserProfile,
  getDueCards,
} from "@/lib/storage";
import type { HSKLevel } from "@/data/vocabulary";
import { LEVEL_DESCRIPTIONS, TOCFL_VOCAB } from "@/data/vocabulary";
import { SHIDAI_UNITS } from "@/data/shidaiVocab";

const LEVEL_COLORS: Record<HSKLevel, string> = {
  A1: "from-green-400 to-green-600",
  A2: "from-teal-400 to-teal-600",
  B1: "from-blue-400 to-blue-600",
  B2: "from-purple-400 to-purple-600",
  C1: "from-orange-400 to-red-500",
  C2: "from-red-500 to-pink-600",
};

const LEVEL_LABEL: Record<HSKLevel, string> = {
  A1: "入門級 Survival",
  A2: "基礎級 Elementary",
  B1: "進階級 Intermediate",
  B2: "高階級 Upper-Intermediate",
  C1: "流利級 Advanced",
  C2: "精通級 Mastery",
};

export default function Home() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [lastSkill, setLastSkill] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<HSKLevel | null>(null);
  const [userName, setUserName] = useState("");
  const [dueCount, setDueCount] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setCompletedLessons(loadCompletedLessons());
    setWordCount(loadCustomWords().length);
    setLastSkill(loadLastActiveSkill());
    const profile = loadUserProfile();
    setUserLevel(profile.level);
    setUserName(profile.name);
    setXp(profile.totalXP);
    setStreak(profile.streak);
    setDueCount(getDueCards().length);
  }, []);

  const totalVocab = TOCFL_VOCAB.length;

  const skills = [
    {
      id: "reading",
      icon: "📖",
      name: "Reading",
      zh: "讀",
      description: "Recognize Traditional Chinese characters in context",
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "writing",
      icon: "✍️",
      name: "Writing",
      zh: "寫",
      description: "Master stroke order and character composition",
      color: "from-purple-400 to-purple-600",
    },
    {
      id: "listening",
      icon: "👂",
      name: "Listening",
      zh: "聽",
      description: "Train your ear for tones and natural speech",
      color: "from-teal-400 to-teal-600",
    },
    {
      id: "speaking",
      icon: "🗣️",
      name: "Speaking",
      zh: "說",
      description: "Build pronunciation and conversational fluency",
      color: "from-orange-400 to-red-500",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-white">🇹🇼 TOCFL Chinese</h1>
          <div className="flex gap-1 flex-wrap justify-end">
            <Link
              href="/study"
              className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm"
            >
              📚 Study
            </Link>
            <Link
              href="/vocabulary"
              className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm"
            >
              📝 My Words
            </Link>
            <Link
              href="/import"
              className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm"
            >
              📥 Import
            </Link>
            <Link
              href="/video-listening"
              className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm"
            >
              🎬 Videos
            </Link>
            <Link
              href="/progress"
              className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm"
            >
              📊 Progress
            </Link>
            <Link
              href="/settings"
              className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm"
            >
              ⚙️ Settings
            </Link>
          </div>
        </div>
      </nav>

      <section className="container py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-white mb-3">
            {userName ? `Welcome back, ${userName}!` : "Master Traditional Chinese"}
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            TOCFL preparation through 4 essential skills — Reading, Writing,
            Listening, and Speaking. Powered by spaced repetition.
          </p>
        </div>

        {/* Level Banner */}
        {userLevel ? (
          <div
            className={`bg-gradient-to-r ${LEVEL_COLORS[userLevel]} rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4`}
          >
            <div>
              <div className="text-white/70 text-sm font-medium mb-1">Your TOCFL Level</div>
              <div className="text-4xl font-black text-white">{userLevel}</div>
              <div className="text-white/80 text-sm">{LEVEL_LABEL[userLevel]}</div>
              <div className="text-white/60 text-xs mt-1">
                {LEVEL_DESCRIPTIONS[userLevel]}
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-white">{xp}</div>
                <div className="text-white/70 text-xs">Total XP</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{streak}</div>
                <div className="text-white/70 text-xs">Day Streak</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{dueCount}</div>
                <div className="text-white/70 text-xs">Cards Due</div>
              </div>
            </div>
            <Link
              href="/study"
              className="bg-white text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition whitespace-nowrap"
            >
              {dueCount > 0 ? `Review ${dueCount} Cards →` : "Study Now →"}
            </Link>
          </div>
        ) : (
          /* Pre-test CTA */
          <div className="bg-white/15 backdrop-blur border border-white/30 rounded-2xl p-8 mb-8 text-center">
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Find Your TOCFL Level
            </h3>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Take our 20-question placement test. We'll recommend the right
              study path and suitable career opportunities.
            </p>
            <Link
              href="/pretest"
              className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 transition inline-block"
            >
              Take Placement Test →
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <Link
            href="/study"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 text-center text-white transition"
          >
            <div className="text-3xl mb-1">🃏</div>
            <div className="font-bold">Flashcards</div>
            <div className="text-xs text-white/70">{totalVocab} words</div>
          </Link>
          <Link
            href="/study"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 text-center text-white transition"
          >
            <div className="text-3xl mb-1">📝</div>
            <div className="font-bold">Quiz</div>
            <div className="text-xs text-white/70">Multiple choice</div>
          </Link>
          <Link
            href="/vocabulary"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 text-center text-white transition"
          >
            <div className="text-3xl mb-1">📝</div>
            <div className="font-bold">My Words</div>
            <div className="text-xs text-white/70">{wordCount} saved</div>
          </Link>
          <Link
            href="/import"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 text-center text-white transition"
          >
            <div className="text-3xl mb-1">📥</div>
            <div className="font-bold">Import</div>
            <div className="text-xs text-white/70">TXT · CSV · Excel</div>
          </Link>
          <Link
            href="/pretest"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 text-center text-white transition"
          >
            <div className="text-3xl mb-1">🎯</div>
            <div className="font-bold">Placement</div>
            <div className="text-xs text-white/70">{userLevel ? "Retake test" : "Take test"}</div>
          </Link>
        </div>

        {/* 4 Skills */}
        <h3 className="text-2xl font-bold text-white mb-4">Skill Practice</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {skills.map((skill) => {
            const done = completedLessons.filter((k) =>
              k.startsWith(skill.id)
            ).length;
            return (
              <Link
                key={skill.id}
                href={`/lessons/${skill.id}`}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all block"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center text-2xl mb-4`}
                >
                  {skill.icon}
                </div>
                <div className="font-bold text-gray-800 text-lg">
                  {skill.name}{" "}
                  <span className="text-gray-400 font-normal text-base">
                    ({skill.zh})
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1 mb-3">
                  {skill.description}
                </p>
                {done > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {done} completed
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Video Listening */}
        <div className="bg-white/15 backdrop-blur rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">🎬 Video Listening</h3>
            <Link href="/video-listening" className="text-white/70 hover:text-white text-sm underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/video-listening" className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition">
              <span className="text-3xl">🏠</span>
              <div>
                <p className="text-white font-bold">我們這一家</p>
                <p className="text-white/70 text-xs">Our Family · Level A2–B1</p>
              </div>
            </Link>
            <Link href="/video-listening" className="bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition">
              <span className="text-3xl">🎀</span>
              <div>
                <p className="text-white font-bold">小丸子</p>
                <p className="text-white/70 text-xs">Chibi Maruko-chan · Level A1–A2</p>
              </div>
            </Link>
          </div>
        </div>

        {/* 時代華語 Book Units */}
        <div className="bg-white/15 backdrop-blur rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">📖 時代華語 Book 1 — Units</h3>
            <span className="text-white/60 text-sm">{SHIDAI_UNITS.length} lessons</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {SHIDAI_UNITS.map((u) => (
              <Link
                key={u.unit}
                href={`/lessons/reading?source=book&unit=${u.unit}`}
                className="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-center transition"
              >
                <div className="text-lg font-black text-yellow-300">L{u.unit}</div>
                <div className="text-white/80 text-xs font-medium leading-tight mt-0.5">{u.titleZh}</div>
                <div className="text-white/50 text-xs mt-0.5">{u.vocab.length} words</div>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            {(["reading", "writing", "listening", "speaking"] as const).map((sk) => (
              <Link
                key={sk}
                href={`/lessons/${sk}?source=book&unit=1`}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-xl font-medium transition capitalize"
              >
                {sk === "reading" ? "📖" : sk === "writing" ? "✍️" : sk === "listening" ? "👂" : "🗣️"} {sk}
              </Link>
            ))}
          </div>
        </div>

        {/* TOCFL Level Guide */}
        <div className="bg-white/15 backdrop-blur rounded-2xl p-6 mb-12">
          <h3 className="text-xl font-bold text-white mb-4">TOCFL Level Guide</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(["A1", "A2", "B1", "B2", "C1", "C2"] as HSKLevel[]).map((lvl) => (
              <div
                key={lvl}
                className={`rounded-xl p-4 ${userLevel === lvl ? "ring-2 ring-white" : ""}`}
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div
                  className={`inline-block text-xs font-black text-white px-2 py-0.5 rounded-md bg-gradient-to-r ${LEVEL_COLORS[lvl]} mb-2`}
                >
                  {lvl}
                </div>
                <p className="text-white/80 text-xs">{LEVEL_DESCRIPTIONS[lvl]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Continue / Get Started */}
        <div className="text-center">
          <Link
            href={lastSkill ? `/lessons/${lastSkill}` : "/study"}
            className="bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-xl hover:bg-blue-50 transition inline-block shadow-xl"
          >
            {lastSkill ? "Continue Learning →" : "Get Started →"}
          </Link>
        </div>
      </section>

      <footer className="bg-white/10 backdrop-blur mt-16 py-8">
        <div className="container text-center text-white/60 text-sm">
          <p>© 2026 TOCFL Chinese — Traditional Chinese Learning Platform</p>
        </div>
      </footer>
    </main>
  );
}
