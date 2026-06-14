"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { pinyin } from "pinyin-pro";
import { PronunciationPlayer } from "@/lib/pronunciation";
import { loadCustomWords, saveCustomWords } from "@/lib/storage";
import type { CustomWord } from "@/lib/storage";
import { guessMeaning, autoPinyin } from "@/lib/guessMeaning";
import { useTheme } from "@/lib/theme";

// ── Practice Mode ─────────────────────────────────────────────────────────────

type PracticeType = "flashcard" | "meaning-quiz" | "char-quiz";

function PracticeMode({ words, onExit }: { words: CustomWord[]; onExit: () => void }) {
  const [mode, setMode] = useState<PracticeType | null>(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [choices, setChoices] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const deck = useCallback(() => [...words].sort(() => Math.random() - 0.5), [words]);
  const [cards, setCards] = useState<CustomWord[]>([]);

  function start(m: PracticeType) {
    const shuffled = deck();
    setCards(shuffled);
    setMode(m);
    setIdx(0);
    setFlipped(false);
    setPicked(null);
    setScore({ correct: 0, wrong: 0 });
    setDone(false);
  }

  useEffect(() => {
    if (!mode || cards.length === 0) return;
    if (mode === "meaning-quiz" || mode === "char-quiz") {
      const current = cards[idx];
      const pool = words.filter((w) => w.id !== current.id);
      const wrong = pool.sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = mode === "meaning-quiz"
        ? [...wrong.map((w) => w.meaning), current.meaning].sort(() => Math.random() - 0.5)
        : [...wrong.map((w) => w.chinese), current.chinese].sort(() => Math.random() - 0.5);
      setChoices(opts);
      setPicked(null);
      setFlipped(false);
    }
  }, [idx, mode, cards, words]);

  function next() {
    if (idx + 1 >= cards.length) { setDone(true); return; }
    setIdx((i) => i + 1);
    setFlipped(false);
    setPicked(null);
  }

  function markFlashcard(correct: boolean) {
    setScore((s) => correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 });
    next();
  }

  function pickChoice(choice: string) {
    if (picked) return;
    setPicked(choice);
    const current = cards[idx];
    const isCorrect = mode === "meaning-quiz" ? choice === current.meaning : choice === current.chinese;
    setScore((s) => isCorrect ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 });
  }

  const current = cards[idx];
  const total = cards.length;
  const py = current ? (current.pinyin || pinyin(current.chinese, { toneType: "symbol", type: "string" })) : "";

  if (!mode) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-white/[0.08] rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🎮 Practice Mode</h2>
            <button onClick={onExit} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">✕</button>
          </div>
          <p className="text-gray-500 dark:text-white/50 text-sm mb-6">{words.length} words in your deck</p>
          <div className="space-y-3">
            {([
              ["flashcard", "🃏 Flashcards", "See the Chinese, flip to reveal meaning"],
              ["meaning-quiz", "🇬🇧 Meaning Quiz", "See Chinese → pick the correct English meaning"],
              ["char-quiz", "🈶 Character Quiz", "See the meaning → pick the correct Chinese character"],
            ] as [PracticeType, string, string][]).map(([type, title, desc]) => (
              <button
                key={type}
                onClick={() => start(type)}
                className="w-full text-left p-4 rounded-2xl border-2 border-gray-100 dark:border-white/[0.08] hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-white/[0.08] transition group"
              >
                <div className="font-bold text-gray-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">{title}</div>
                <div className="text-gray-400 dark:text-white/40 text-sm">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score.correct / total) * 100);
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-white/[0.08] rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
          <div className="text-6xl mb-4">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Session Complete!</h2>
          <div className="flex justify-center gap-6 my-6">
            <div><div className="text-3xl font-black text-green-500">{score.correct}</div><div className="text-xs text-gray-400 dark:text-white/40">Correct</div></div>
            <div><div className="text-3xl font-black text-red-400">{score.wrong}</div><div className="text-xs text-gray-400 dark:text-white/40">Wrong</div></div>
            <div><div className="text-3xl font-black text-blue-500">{pct}%</div><div className="text-xs text-gray-400 dark:text-white/40">Score</div></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => start(mode)} className="flex-1 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition text-sm">
              Try Again
            </button>
            <button onClick={() => setMode(null)} className="flex-1 py-2.5 bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/[0.12] transition text-sm">
              Change Mode
            </button>
            <button onClick={onExit} className="flex-1 py-2.5 bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/[0.12] transition text-sm">
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between text-white">
        <button onClick={onExit} className="text-white/60 hover:text-white text-sm">✕ Exit</button>
        <div className="text-sm font-medium">{idx + 1} / {total}</div>
        <div className="text-sm">
          <span className="text-green-400 font-bold">{score.correct}✓</span>
          {" · "}
          <span className="text-red-400 font-bold">{score.wrong}✗</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg h-1.5 bg-white/20 rounded-full mb-6">
        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${(idx / total) * 100}%` }} />
      </div>

      {/* Flashcard mode */}
      {mode === "flashcard" && current && (
        <div
          onClick={() => setFlipped((f) => !f)}
          className="w-full max-w-lg bg-white dark:bg-[#1a1d27] rounded-3xl shadow-2xl p-8 text-center cursor-pointer select-none min-h-56 flex flex-col items-center justify-center"
        >
          {!flipped ? (
            <>
              <div className="text-6xl font-bold text-gray-800 dark:text-white mb-3">{current.chinese}</div>
              <div className="text-blue-400 text-lg">{py}</div>
              <p className="text-gray-300 dark:text-white/30 text-xs mt-4">Tap to reveal meaning</p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{current.meaning}</div>
              {current.example && <p className="text-gray-400 dark:text-white/40 text-sm italic mt-2">{current.example}</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={(e) => { e.stopPropagation(); markFlashcard(false); }}
                  className="px-6 py-2.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-500/30 transition text-sm">
                  ✗ Didn&apos;t know
                </button>
                <button onClick={(e) => { e.stopPropagation(); markFlashcard(true); }}
                  className="px-6 py-2.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 font-bold rounded-xl hover:bg-green-200 dark:hover:bg-green-500/30 transition text-sm">
                  ✓ Got it!
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Quiz modes */}
      {(mode === "meaning-quiz" || mode === "char-quiz") && current && (
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-[#1a1d27] rounded-3xl shadow-2xl p-8 text-center mb-4">
            {mode === "meaning-quiz" ? (
              <>
                <div className="text-6xl font-bold text-gray-800 dark:text-white mb-2">{current.chinese}</div>
                <div className="text-blue-400 text-lg">{py}</div>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-2">What does this mean?</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{current.meaning}</div>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-1">Which character is this?</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {choices.map((choice) => {
              const isCorrect = mode === "meaning-quiz" ? choice === current.meaning : choice === current.chinese;
              let cls = "bg-white dark:bg-white/[0.06] text-gray-800 dark:text-white hover:bg-blue-50 dark:hover:bg-white/[0.1] border-2 border-gray-100 dark:border-white/[0.08] hover:border-blue-300";
              if (picked) {
                if (choice === picked && isCorrect) cls = "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border-2 border-green-400";
                else if (choice === picked && !isCorrect) cls = "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-2 border-red-400";
                else if (isCorrect) cls = "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-2 border-green-300";
                else cls = "bg-white dark:bg-white/[0.03] text-gray-300 dark:text-white/20 border-2 border-gray-100 dark:border-white/[0.05]";
              }
              return (
                <button key={choice} onClick={() => pickChoice(choice)}
                  className={`rounded-2xl p-4 font-medium text-sm transition ${cls} ${mode === "char-quiz" ? "text-2xl" : ""}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {picked && (
            <button onClick={next} className="w-full mt-4 py-3 bg-yellow-400 text-gray-900 font-bold rounded-2xl hover:bg-yellow-300 transition">
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function VocabularyPage() {
  const { theme, toggle } = useTheme();
  const [words, setWords] = useState<CustomWord[]>([]);
  const [formData, setFormData] = useState({ chinese: "", pinyin: "", meaning: "", example: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [practicing, setPracticing] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ meaning: "", example: "" });

  useEffect(() => {
    const raw = loadCustomWords();
    let changed = false;
    const filled = raw.map((w) => {
      const updates: Partial<CustomWord> = {};
      if (!w.pinyin) { updates.pinyin = autoPinyin(w.chinese); changed = true; }
      if (!w.meaning) {
        const guess = guessMeaning(w.chinese);
        if (guess) { updates.meaning = guess; changed = true; }
      }
      return Object.keys(updates).length > 0 ? { ...w, ...updates } : w;
    });
    if (changed) saveCustomWords(filled);
    setWords(filled);
    setLoading(false);
  }, []);

  function saveAll(updated: CustomWord[]) {
    saveCustomWords(updated);
    setWords(updated);
  }

  function handleAddWord(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.chinese || !formData.meaning) { alert("Chinese and meaning are required"); return; }
    const py = formData.pinyin || pinyin(formData.chinese, { toneType: "symbol", type: "string" });
    saveAll([{ id: Date.now().toString(), chinese: formData.chinese, pinyin: py, meaning: formData.meaning, example: formData.example, createdAt: new Date().toLocaleDateString() }, ...words]);
    setFormData({ chinese: "", pinyin: "", meaning: "", example: "" });
    setShowForm(false);
  }

  function handleDelete(id: string) {
    saveAll(words.filter((w) => w.id !== id));
  }

  function startEdit(word: CustomWord) {
    setEditId(word.id);
    setEditData({ meaning: word.meaning, example: word.example ?? "" });
  }

  function commitEdit(id: string) {
    saveAll(words.map((w) => w.id === id ? { ...w, meaning: editData.meaning, example: editData.example } : w));
    setEditId(null);
  }

  function handlePlay(wordId: string, chinese: string) {
    if (playingId === wordId) { PronunciationPlayer.stopSpeaking(); setPlayingId(null); }
    else { PronunciationPlayer.speak(chinese, "zh-TW"); setPlayingId(wordId); }
  }

  const filtered = words.filter((w) => {
    const q = search.toLowerCase();
    return !q || w.chinese.includes(q) || w.meaning.toLowerCase().includes(q) || w.pinyin.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-[#0f1117] flex items-center justify-center">
        <p className="text-gray-500 dark:text-white/50">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white">
      {practicing && words.length > 0 && (
        <PracticeMode words={words} onExit={() => setPracticing(false)} />
      )}

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur border-b border-gray-200 dark:border-white/[0.06] px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">← Home</Link>
        <h1 className="font-bold text-sm">📚 My Words</h1>
        <button onClick={toggle} className="text-lg">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="container py-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h2 className="text-3xl font-bold">My Words</h2>
          <div className="flex gap-2 flex-wrap">
            <Link href="/import-doc" className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.1] text-gray-700 dark:text-white px-4 py-2 rounded-xl font-medium transition text-sm">
              📄 Doc Import
            </Link>
            <Link href="/import" className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.1] text-gray-700 dark:text-white px-4 py-2 rounded-xl font-medium transition text-sm">
              📥 File Import
            </Link>
            {words.length > 0 && (
              <button onClick={() => setPracticing(true)}
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-4 py-2 rounded-xl font-bold transition text-sm">
                🎮 Practice ({words.length})
              </button>
            )}
            <button onClick={() => setShowForm(!showForm)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 px-4 py-2 rounded-xl font-bold transition text-sm">
              {showForm ? "✕ Cancel" : "+ Add Word"}
            </button>
          </div>
        </div>

        {/* Add Word Form */}
        {showForm && (
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add New Word</h2>
            <form onSubmit={handleAddWord} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1 uppercase">Chinese *</label>
                <input type="text" placeholder="龍" value={formData.chinese}
                  onChange={(e) => setFormData({ ...formData, chinese: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 rounded-xl focus:outline-none focus:border-blue-500 text-2xl" maxLength={10} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1 uppercase">Pinyin (auto if blank)</label>
                <input type="text" placeholder="lóng" value={formData.pinyin}
                  onChange={(e) => setFormData({ ...formData, pinyin: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 rounded-xl focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1 uppercase">Meaning *</label>
                <input type="text" placeholder="dragon" value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 rounded-xl focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1 uppercase">Example (optional)</label>
                <input type="text" placeholder="中國的龍很重要。" value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 rounded-xl focus:outline-none focus:border-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
                  ✓ Save Word
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        {words.length > 0 && (
          <div className="mb-5">
            <input type="text" placeholder="Search words, pinyin, or meaning…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
        )}

        {/* Words Grid */}
        {words.length === 0 ? (
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl text-center py-16 shadow-lg">
            <p className="text-gray-500 dark:text-white/50 text-xl mb-4">No words yet</p>
            <p className="text-gray-400 dark:text-white/40 text-sm mb-6">Import a document or add words manually</p>
            <div className="flex justify-center gap-3">
              <Link href="/import-doc" className="px-5 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition text-sm">📄 Doc Import</Link>
              <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition text-sm">+ Add Word</button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-white/50 text-center py-12">No words match &quot;{search}&quot;</p>
        ) : (
          <>
            <p className="text-gray-500 dark:text-white/50 text-xs mb-3">{filtered.length} of {words.length} words</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((word) => (
                <div key={word.id} className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-sm p-5 relative">
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button onClick={() => startEdit(word)} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/[0.08] hover:bg-blue-100 dark:hover:bg-blue-500/20 text-gray-400 hover:text-blue-600 flex items-center justify-center text-xs transition" title="Edit">✎</button>
                    <button onClick={() => handleDelete(word.id)} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/[0.08] hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-400 hover:text-red-500 flex items-center justify-center text-xs transition" title="Delete">✕</button>
                  </div>

                  <div className="text-5xl font-bold text-gray-800 dark:text-white mb-1 leading-none">{word.chinese}</div>
                  <div className="text-purple-500 dark:text-purple-400 font-medium mb-1">{word.pinyin || pinyin(word.chinese, { toneType: "symbol", type: "string" })}</div>

                  {editId === word.id ? (
                    <div className="mt-2 space-y-2">
                      <input value={editData.meaning} onChange={(e) => setEditData({ ...editData, meaning: e.target.value })}
                        placeholder="Meaning" className="w-full text-sm bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400" />
                      <input value={editData.example} onChange={(e) => setEditData({ ...editData, example: e.target.value })}
                        placeholder="Example sentence" className="w-full text-sm bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400" />
                      <div className="flex gap-2">
                        <button onClick={() => commitEdit(word.id)} className="flex-1 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition">Save</button>
                        <button onClick={() => setEditId(null)} className="flex-1 py-1.5 bg-gray-100 dark:bg-white/[0.08] text-gray-600 dark:text-white text-xs font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.12] transition">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {word.meaning ? (
                        <div className="text-gray-700 dark:text-white/80 text-sm mb-2">{word.meaning}</div>
                      ) : (
                        <button onClick={() => startEdit(word)} className="text-orange-400 text-xs underline mb-2">Add meaning →</button>
                      )}
                      {word.example && (
                        <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-2.5 mb-3 text-xs text-gray-500 dark:text-white/50 italic">{word.example}</div>
                      )}
                    </>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handlePlay(word.id, word.chinese)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${playingId === word.id ? "bg-red-500 text-white" : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30"}`}>
                      {playingId === word.id ? "⏹ Stop" : "🔊 Listen"}
                    </button>
                  </div>

                  <div className="text-xs text-gray-300 dark:text-white/20 mt-2">{word.createdAt}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
