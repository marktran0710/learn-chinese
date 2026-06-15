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
import { useTheme } from "@/lib/theme";
import type { HSKLevel } from "@/data/vocabulary";
import { LEVEL_DESCRIPTIONS, TOCFL_VOCAB } from "@/data/vocabulary";
import { SHIDAI_UNITS } from "@/data/shidaiVocab";

// ── helpers ───────────────────────────────────────────────────────────────────

const LEVEL_BADGE: Record<HSKLevel, string> = {
  A1: "bg-emerald-500", A2: "bg-teal-500",
  B1: "bg-blue-500",    B2: "bg-violet-500",
  C1: "bg-orange-500",  C2: "bg-red-500",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 mb-3">{children}</p>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [wordCount, setWordCount]   = useState(0);
  const [lastSkill, setLastSkill]   = useState<string | null>(null);
  const [userLevel, setUserLevel]   = useState<HSKLevel | null>(null);
  const [userName, setUserName]     = useState("");
  const [dueCount, setDueCount]     = useState(0);
  const [xp, setXp]                 = useState(0);
  const [streak, setStreak]         = useState(0);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    setCompletedLessons(loadCompletedLessons());
    setWordCount(loadCustomWords().length);
    setLastSkill(loadLastActiveSkill());
    const p = loadUserProfile();
    setUserLevel(p.level); setUserName(p.name);
    setXp(p.totalXP); setStreak(p.streak);
    setDueCount(getDueCards().length);
  }, []);

  const skills = [
    { id: "reading",   icon: "📖", name: "Reading",   zh: "讀", color: "from-sky-500 to-blue-600" },
    { id: "writing",   icon: "✍️", name: "Writing",   zh: "寫", color: "from-violet-500 to-purple-600" },
    { id: "listening", icon: "👂", name: "Listening", zh: "聽", color: "from-teal-500 to-cyan-600" },
    { id: "speaking",  icon: "🗣️", name: "Speaking",  zh: "說", color: "from-orange-500 to-amber-600" },
  ] as const;

  const navLinkClass = "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white">

      {/* ── Sidebar + Content layout ─────────────────────────────────────── */}
      <div className="flex min-h-screen">

        {/* ── Left sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white dark:bg-white/[0.03] border-r border-gray-200 dark:border-white/[0.06] sticky top-0 h-screen overflow-y-auto py-6 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 px-2">
            <span className="text-2xl font-black">🇹🇼</span>
            <span className="font-black text-lg">TOCFL</span>
          </Link>

          {/* Nav groups */}
          <nav className="flex-1 space-y-6 overflow-y-auto">
            <div>
              <SectionLabel>Vocabulary</SectionLabel>
              <div className="space-y-0.5">
                {[
                  ["/study",      "🃏", "Flashcard Study"],
                  ["/vocabulary", "📝", "My Words"],
                  ["/dictionary", "📖", "Dictionary"],
                  ["/import",     "📥", "Import"],
                ].map(([href, icon, label]) => (
                  <Link key={href as string} href={href as string} className={navLinkClass}>
                    <span>{icon}</span><span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Content</SectionLabel>
              <div className="space-y-0.5">
                {[
                  ["/b1-book",         "📗", "B1 TOCFL Book"],
                  ["/video-listening", "🎬", "Video Listening"],
                ].map(([href, icon, label]) => (
                  <Link key={href as string} href={href as string} className={navLinkClass}>
                    <span>{icon}</span><span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Skills</SectionLabel>
              <div className="space-y-0.5">
                {skills.map((s) => (
                  <Link key={s.id} href={`/lessons/${s.id}`} className={navLinkClass}>
                    <span>{s.icon}</span>
                    <span>{s.name} <span className="text-gray-400 dark:text-white/30">({s.zh})</span></span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Me</SectionLabel>
              <div className="space-y-0.5">
                {[
                  ["/progress", "📊", "Progress"],
                  ["/pretest",  "🎯", "Placement Test"],
                  ["/settings", "⚙️", "Settings"],
                ].map(([href, icon, label]) => (
                  <Link key={href as string} href={href as string} className={navLinkClass}>
                    <span>{icon}</span><span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Theme toggle + Level chip */}
          <div className="mt-4 space-y-2">
            <button
              onClick={toggle}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all"
            >
              <span>{theme === "dark" ? "☀️" : "🌙"}</span>
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>

            {userLevel && (
              <div className={`rounded-xl px-3 py-2.5 ${LEVEL_BADGE[userLevel]} bg-opacity-20`}>
                <div className="text-xs text-gray-500 dark:text-white/50">Your level</div>
                <div className="text-xl font-black">{userLevel}</div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">

          {/* Mobile top nav */}
          <header className="lg:hidden bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur sticky top-0 z-50 border-b border-gray-200 dark:border-white/[0.06] px-4 py-3 flex justify-between items-center">
            <Link href="/" className="font-black text-lg">🇹🇼 TOCFL</Link>
            <div className="flex gap-1 text-sm">
              <Link href="/study"      className="px-2 py-1 rounded-lg text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">🃏</Link>
              <Link href="/vocabulary" className="px-2 py-1 rounded-lg text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">📝</Link>
              <Link href="/dictionary" className="px-2 py-1 rounded-lg text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">📖</Link>
              <Link href="/import"     className="px-2 py-1 rounded-lg text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">📥</Link>
              <Link href="/b1-book"    className="px-2 py-1 rounded-lg text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">📗</Link>
              <Link href="/progress"   className="px-2 py-1 rounded-lg text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">📊</Link>
              <button onClick={toggle} className="px-2 py-1 rounded-lg text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          </header>

          <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-10">

            {/* ── Welcome / Level banner ──────────────────────────────── */}
            {userLevel ? (
              <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${
                { A1:"from-emerald-600 to-teal-700", A2:"from-teal-600 to-cyan-700",
                  B1:"from-blue-600 to-indigo-700",  B2:"from-violet-600 to-purple-700",
                  C1:"from-orange-600 to-red-700",   C2:"from-red-600 to-pink-700" }[userLevel]
              }`}>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)]" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div>
                    <p className="text-white/70 text-sm mb-1">
                      {userName ? `Welcome back, ${userName}!` : "Welcome back!"} · Current Level
                    </p>
                    <div className="text-5xl font-black text-white mb-1">{userLevel}</div>
                    <p className="text-white/70 text-sm max-w-xs">{LEVEL_DESCRIPTIONS[userLevel]}</p>
                  </div>
                  <div className="flex gap-5 sm:gap-8 text-center shrink-0">
                    {[["XP", xp], ["Streak", streak], ["Due", dueCount]].map(([l, v]) => (
                      <div key={l as string}>
                        <div className="text-3xl font-black text-white">{v}</div>
                        <div className="text-white/60 text-xs">{l}</div>
                      </div>
                    ))}
                  </div>
                  <Link href="/study"
                    className="shrink-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm">
                    {dueCount > 0 ? `Review ${dueCount} cards →` : "Study now →"}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-8 flex flex-col sm:flex-row items-center gap-6">
                <div className="text-5xl">🎯</div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl font-bold mb-1">Find Your TOCFL Level</h2>
                  <p className="text-gray-500 dark:text-white/50 text-sm">Take our 20-question placement test to get a personalised study path.</p>
                </div>
                <Link href="/pretest"
                  className="shrink-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition text-sm">
                  Take Test →
                </Link>
              </div>
            )}

            {/* ── Vocabulary ──────────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold">Vocabulary</h2>
                  <p className="text-gray-400 dark:text-white/40 text-xs">Build, review, and drill your word bank</p>
                </div>
                <Link href="/vocabulary" className="text-xs text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition">{wordCount} saved →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { href:"/study",      icon:"🃏", title:"Flashcard Study",   sub:`${TOCFL_VOCAB.length} words · spaced repetition`, accent:"from-sky-500/20 to-blue-600/20",    border:"border-sky-500/30",   badge: dueCount > 0 ? `${dueCount} due` : "" },
                  { href:"/vocabulary", icon:"📝", title:"My Words",          sub:`${wordCount} saved · practice & edit`,             accent:"from-violet-500/20 to-purple-600/20", border:"border-violet-500/30", badge:"" },
                  { href:"/dictionary", icon:"📖", title:"Dictionary",        sub:"Search TOCFL · pinyin · English",                  accent:"from-amber-500/20 to-yellow-600/20", border:"border-amber-500/30",  badge:"" },
                  { href:"/import",     icon:"📥", title:"Import Vocabulary", sub:"PDF · DOCX · TXT · paste text",                   accent:"from-indigo-500/20 to-blue-700/20",  border:"border-indigo-500/30", badge:"" },
                ].map((c) => (
                  <Link key={c.href} href={c.href}
                    className={`group relative rounded-2xl border ${c.border} bg-gradient-to-br ${c.accent} p-5 hover:brightness-110 transition-all`}>
                    <div className="text-2xl mb-3">{c.icon}</div>
                    <div className="font-bold text-sm mb-0.5">{c.title}</div>
                    <div className="text-gray-500 dark:text-white/50 text-xs">{c.sub}</div>
                    {c.badge && (
                      <span className="absolute top-3 right-3 text-xs bg-yellow-400 text-gray-900 font-bold px-2 py-0.5 rounded-full">{c.badge}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>

            {/* ── Skills Practice ─────────────────────────────────────── */}
            <section>
              <div className="mb-4">
                <h2 className="text-base font-bold">Skills Practice</h2>
                <p className="text-gray-400 dark:text-white/40 text-xs">Targeted exercises for all four TOCFL skills</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {skills.map((s) => {
                  const done = completedLessons.filter((k) => k.startsWith(s.id)).length;
                  return (
                    <Link key={s.id} href={`/lessons/${s.id}`}
                      className="group rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.08] p-5 transition-all">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>
                        {s.icon}
                      </div>
                      <div className="font-bold text-sm">{s.name}</div>
                      <div className="text-gray-400 dark:text-white/40 text-xs mt-0.5">{s.zh}</div>
                      {done > 0 && (
                        <div className="mt-2 text-xs text-emerald-500 dark:text-emerald-400 font-medium">{done} completed</div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* ── Content ─────────────────────────────────────────────── */}
            <section>
              <div className="mb-4">
                <h2 className="text-base font-bold">Learn from Content</h2>
                <p className="text-gray-400 dark:text-white/40 text-xs">Real materials — books and videos with synced transcripts</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {[
                  { href:"/b1-book",         icon:"📗", title:"B1 TOCFL Book",   sub:"10 units · 29 lessons · audio + AI transcripts", accent:"from-emerald-500/20 to-green-700/20", border:"border-emerald-500/30" },
                  { href:"/video-listening", icon:"🎬", title:"Video Listening", sub:"我們這一家 · 小丸子 · synced transcripts",          accent:"from-rose-500/20 to-orange-600/20",  border:"border-rose-500/30"    },
                ].map((c) => (
                  <Link key={c.href} href={c.href}
                    className={`rounded-2xl border ${c.border} bg-gradient-to-br ${c.accent} p-5 hover:brightness-110 transition-all`}>
                    <div className="text-2xl mb-3">{c.icon}</div>
                    <div className="font-bold text-sm mb-1">{c.title}</div>
                    <div className="text-gray-500 dark:text-white/50 text-xs">{c.sub}</div>
                  </Link>
                ))}
              </div>

              {/* 時代華語 book unit grid */}
              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-sm">📖 時代華語 Book 1</div>
                    <div className="text-gray-400 dark:text-white/40 text-xs">Jump to any unit</div>
                  </div>
                  <div className="flex gap-2">
                    {(["reading","writing","listening","speaking"] as const).map((sk) => (
                      <Link key={sk} href={`/lessons/${sk}?source=book&unit=1`}
                        className="text-xs bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-lg transition capitalize">{sk[0].toUpperCase()}</Link>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {SHIDAI_UNITS.map((u) => (
                    <Link key={u.unit} href={`/lessons/reading?source=book&unit=${u.unit}`}
                      className="bg-gray-50 dark:bg-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.14] rounded-xl py-2 text-center transition group">
                      <div className="text-yellow-500 dark:text-yellow-400 font-black text-xs">L{u.unit}</div>
                      <div className="text-gray-400 dark:text-white/40 text-xs leading-none truncate px-1 mt-0.5 group-hover:text-gray-600 dark:group-hover:text-white/60">{u.titleZh}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Bottom row: Progress + Level Guide ──────────────────── */}
            <section>
              <div className="mb-4">
                <h2 className="text-base font-bold">My Progress</h2>
                <p className="text-gray-400 dark:text-white/40 text-xs">Results, level, and settings</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {[
                  { href:"/progress", icon:"📊", title:"Progress Dashboard", sub:"XP · streaks · SRS stats" },
                  { href:"/pretest",  icon:"🎯", title:"Placement Test",     sub: userLevel ? `Level ${userLevel} — retake anytime` : "Find your level" },
                  { href:"/settings", icon:"⚙️", title:"Settings",           sub:"Name · level · preferences" },
                ].map((c) => (
                  <Link key={c.href} href={c.href}
                    className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.08] p-4 transition-all flex items-start gap-3">
                    <span className="text-2xl shrink-0">{c.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{c.title}</div>
                      <div className="text-gray-400 dark:text-white/40 text-xs mt-0.5">{c.sub}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* TOCFL Level Guide */}
              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">TOCFL Level Guide</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(["A1","A2","B1","B2","C1","C2"] as HSKLevel[]).map((lvl) => (
                    <div key={lvl} className={`rounded-xl p-3 bg-gray-50 dark:bg-white/[0.04] border ${userLevel === lvl ? "border-gray-400 dark:border-white/40 bg-gray-100 dark:bg-white/10" : "border-gray-200 dark:border-white/[0.06]"}`}>
                      <span className={`inline-block text-xs font-black text-white px-2 py-0.5 rounded-md ${LEVEL_BADGE[lvl]} mb-2`}>{lvl}</span>
                      <p className="text-gray-500 dark:text-white/50 text-xs leading-snug">{LEVEL_DESCRIPTIONS[lvl]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── CTA ─────────────────────────────────────────────────── */}
            <div className="text-center pb-6">
              <Link href={lastSkill ? `/lessons/${lastSkill}` : "/study"}
                className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-10 py-3.5 rounded-2xl hover:opacity-90 transition shadow-xl text-base">
                {lastSkill ? "Continue Learning →" : "Get Started →"}
              </Link>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
