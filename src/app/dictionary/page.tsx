"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { TOCFL_VOCAB } from "@/data/vocabulary";
import type { VocabEntry, HSKLevel } from "@/data/vocabulary";
import { useTheme } from "@/lib/theme";
import { pinyin } from "pinyin-pro";
import { loadCustomWords, saveCustomWords } from "@/lib/storage";
import { guessMeaning } from "@/lib/guessMeaning";

// ── Helpers ───────────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<HSKLevel, string> = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  A2: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  B1: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  B2: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  C1: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  C2: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

function speak(text: string) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-TW";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function getCharBreakdown(char: string): { pinyin: string; meaning: string } | null {
  const entry = TOCFL_VOCAB.find((v) => v.traditional === char);
  if (entry) return { pinyin: entry.pinyin, meaning: entry.meaning };
  const py = pinyin(char, { toneType: "symbol", type: "string" });
  const meaning = guessMeaning(char);
  return { pinyin: py, meaning: meaning || "—" };
}

// ── Result card ───────────────────────────────────────────────────────────────

function EntryCard({ entry, onSave, saved }: {
  entry: VocabEntry;
  onSave: (e: VocabEntry) => void;
  saved: boolean;
}) {
  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <button
            onClick={() => speak(entry.traditional)}
            className="text-4xl font-bold hover:opacity-70 transition text-left"
            title="Click to hear pronunciation"
          >
            {entry.traditional}
          </button>
          <div className="text-lg text-violet-600 dark:text-violet-400 mt-1">{entry.pinyin}</div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[entry.level]}`}>
            {entry.level}
          </span>
          <span className="text-xs text-gray-400 dark:text-white/40 capitalize">{entry.partOfSpeech}</span>
        </div>
      </div>

      <p className="text-gray-700 dark:text-white/80 font-medium mb-3">{entry.meaning}</p>

      {entry.example && (
        <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-3 mb-3">
          <button
            onClick={() => speak(entry.example!)}
            className="text-sm font-medium text-gray-800 dark:text-white/80 hover:opacity-70 transition text-left w-full"
          >
            {entry.example} 🔊
          </button>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{entry.exampleTranslation}</p>
        </div>
      )}

      <button
        onClick={() => onSave(entry)}
        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
          saved
            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            : "bg-gray-100 dark:bg-white/[0.08] text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/[0.14]"
        }`}
      >
        {saved ? "✓ Saved to My Words" : "+ Save to My Words"}
      </button>
    </div>
  );
}

// ── Unknown word card ─────────────────────────────────────────────────────────

function UnknownCard({ word, onSave, saved }: {
  word: string;
  onSave: (w: string) => void;
  saved: boolean;
}) {
  const py = pinyin(word, { toneType: "symbol", type: "string" });
  const meaning = guessMeaning(word);
  const chars = word.length > 1 ? [...word] : [];

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <button
            onClick={() => speak(word)}
            className="text-4xl font-bold hover:opacity-70 transition text-left"
          >
            {word}
          </button>
          <div className="text-lg text-violet-600 dark:text-violet-400 mt-1">{py}</div>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40 shrink-0">
          Not in TOCFL
        </span>
      </div>

      {meaning && <p className="text-gray-700 dark:text-white/80 font-medium mb-3">{meaning}</p>}

      {chars.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-2">Character breakdown</p>
          <div className="flex flex-wrap gap-2">
            {chars.map((ch, i) => {
              const info = getCharBreakdown(ch);
              return (
                <div key={i} className="bg-gray-50 dark:bg-white/[0.06] rounded-xl px-3 py-2 text-center min-w-[60px]">
                  <button onClick={() => speak(ch)} className="text-xl font-bold hover:opacity-70">{ch}</button>
                  <div className="text-xs text-violet-500 dark:text-violet-400">{info?.pinyin}</div>
                  <div className="text-xs text-gray-500 dark:text-white/40 mt-0.5 leading-tight">{info?.meaning}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => onSave(word)}
        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
          saved
            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            : "bg-gray-100 dark:bg-white/[0.08] text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/[0.14]"
        }`}
      >
        {saved ? "✓ Saved to My Words" : "+ Save to My Words"}
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DictionaryPage() {
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VocabEntry[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("dict.recent");
    if (stored) setRecent(JSON.parse(stored));
    const words = loadCustomWords();
    setSavedIds(new Set(words.map((w) => w.chinese)));
    inputRef.current?.focus();
  }, []);

  function search(q: string) {
    setQuery(q);
    const t = q.trim();
    if (!t) { setResults([]); setUnknown([]); return; }

    // Exact + prefix + meaning search in TOCFL
    const exact = TOCFL_VOCAB.filter((v) => v.traditional === t || v.pinyin === t.toLowerCase());
    const prefix = TOCFL_VOCAB.filter(
      (v) => !exact.includes(v) && (v.traditional.includes(t) || v.meaning.toLowerCase().includes(t.toLowerCase()))
    ).slice(0, 12);
    setResults([...exact, ...prefix]);

    // If it looks like Chinese and isn't fully found, show unknown card
    if (/[一-鿿]/.test(t) && !exact.length) {
      setUnknown([t]);
    } else {
      setUnknown([]);
    }

    // Save to recent
    setRecent((prev) => {
      const next = [t, ...prev.filter((r) => r !== t)].slice(0, 8);
      localStorage.setItem("dict.recent", JSON.stringify(next));
      return next;
    });
  }

  function saveEntry(entry: VocabEntry) {
    const words = loadCustomWords();
    if (!words.find((w) => w.chinese === entry.traditional)) {
      words.push({ id: Date.now().toString(), chinese: entry.traditional, pinyin: entry.pinyin, meaning: entry.meaning });
      saveCustomWords(words);
    }
    setSavedIds((prev) => new Set([...prev, entry.traditional]));
  }

  function saveUnknown(word: string) {
    const words = loadCustomWords();
    if (!words.find((w) => w.chinese === word)) {
      const py = pinyin(word, { toneType: "symbol", type: "string" });
      const meaning = guessMeaning(word);
      words.push({ id: Date.now().toString(), chinese: word, pinyin: py, meaning });
      saveCustomWords(words);
    }
    setSavedIds((prev) => new Set([...prev, word]));
  }

  const hasResults = results.length > 0 || unknown.length > 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur border-b border-gray-200 dark:border-white/[0.06] px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">← Home</Link>
        <h1 className="font-bold text-sm">📖 Dictionary</h1>
        <button onClick={toggle} className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => search(e.target.value)}
              placeholder="Search Chinese, pinyin, or English…"
              className="w-full pl-11 pr-4 py-4 rounded-2xl text-base bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 shadow-sm"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults([]); setUnknown([]); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
              >✕</button>
            )}
          </div>
        </div>

        {/* Recent searches */}
        {!hasResults && recent.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">Recent</p>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => search(r)}
                  className="px-3 py-1.5 rounded-xl text-sm bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.1] transition"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {query && !hasResults && (
          <div className="text-center py-12 text-gray-400 dark:text-white/30">
            <div className="text-4xl mb-3">🔎</div>
            <p>No results for <strong className="text-gray-600 dark:text-white/60">"{query}"</strong></p>
            <p className="text-sm mt-1">Try a different word, pinyin, or English meaning</p>
          </div>
        )}

        {/* Unknown word result */}
        {unknown.map((w) => (
          <div key={w} className="mb-4">
            <UnknownCard word={w} onSave={saveUnknown} saved={savedIds.has(w)} />
          </div>
        ))}

        {/* TOCFL results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
              {results.length} result{results.length !== 1 ? "s" : ""} in TOCFL
            </p>
            {results.map((e) => (
              <EntryCard key={e.id} entry={e} onSave={saveEntry} saved={savedIds.has(e.traditional)} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!query && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-xl font-bold mb-2">Chinese Dictionary</h2>
            <p className="text-gray-500 dark:text-white/40 text-sm max-w-sm mx-auto">
              Search any Chinese word, pinyin, or English meaning. Covers all {TOCFL_VOCAB.length} TOCFL vocabulary words with character breakdown for unknown words.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["你好", "學習", "謝謝", "漂亮", "重要", "work"].map((w) => (
                <button
                  key={w}
                  onClick={() => search(w)}
                  className="px-4 py-2 rounded-xl text-sm bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.1] transition"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
