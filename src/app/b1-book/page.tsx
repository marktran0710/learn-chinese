"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { B1_UNITS, type B1Lesson, type B1Unit } from "@/data/b1Book";
import { pinyin } from "pinyin-pro";

interface Segment { start: number; end: number; text: string }
interface Transcript { text: string; segments: Segment[] }

// ── Audio Player with transcript sync ────────────────────────────────────────
function AudioWithTranscript({ audioFile }: { audioFile: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPinyin, setShowPinyin] = useState(true);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setTranscript(null);
    setError("");
    // Auto-load cached transcript
    fetch(`/transcripts/b1/${audioFile}.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setTranscript(data as Transcript); })
      .catch(() => {});
  }, [audioFile]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDur);
      a.removeEventListener("ended", onEnd);
    };
  }, [audioFile]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentTime]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Number(e.target.value);
  }

  function seekTo(t: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t;
    a.play();
    setPlaying(true);
  }

  async function transcribe() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/b1-transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioFile }),
      });
      const data = await res.json() as Transcript & { error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Transcription failed");
      } else {
        setTranscript(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function fmt(s: number) {
    if (!isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  }

  const activeIdx = transcript?.segments.findIndex(
    (s) => currentTime >= s.start && currentTime < s.end
  ) ?? -1;

  return (
    <div className="space-y-3">
      <audio ref={audioRef} src={`/audio/b1/${audioFile}.mp3`} preload="metadata" />

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center font-bold text-xl hover:bg-yellow-300 transition shrink-0"
          >
            {playing ? "⏸" : "▶"}
          </button>
          <div className="flex-1">
            <input
              type="range" min={0} max={duration || 100} value={currentTime}
              onChange={seek} className="w-full accent-yellow-400"
            />
            <div className="flex justify-between text-xs text-white/50 mt-0.5">
              <span>{fmt(currentTime)}</span>
              <span>{duration ? fmt(duration) : "..."}</span>
            </div>
          </div>
          {transcript && (
            <button
              onClick={() => setShowPinyin((v) => !v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${showPinyin ? "bg-purple-500 text-white" : "bg-white/20 text-white"}`}
            >
              拼音
            </button>
          )}
        </div>
      </div>

      {/* Transcript */}
      {transcript ? (
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-3">
            Transcript — click any line to jump
          </p>
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {transcript.segments.map((seg, i) => {
              const isActive = i === activeIdx;
              const py = showPinyin ? pinyin(seg.text, { toneType: "symbol", type: "string", nonZh: "consecutive" }) : null;
              return (
                <div
                  key={i}
                  ref={isActive ? activeRef : null}
                  onClick={() => seekTo(seg.start)}
                  className={`rounded-xl px-3 py-2 cursor-pointer transition-all border-2 ${
                    isActive
                      ? "bg-yellow-50 border-yellow-400 shadow"
                      : "bg-white/5 border-transparent hover:bg-white/15"
                  }`}
                >
                  <div className="flex gap-2 items-start">
                    <span className={`text-xs font-mono mt-0.5 shrink-0 ${isActive ? "text-yellow-600 font-bold" : "text-white/30"}`}>
                      {fmt(seg.start)}
                    </span>
                    <div>
                      {py && <p className="text-xs text-purple-300 leading-snug">{py}</p>}
                      <p className={`text-base leading-snug ${isActive ? "text-gray-900 font-medium" : "text-white"}`}>
                        {seg.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <p className="text-white/60 text-sm mb-3">
            No transcript yet. Generate one using the OpenAI Whisper API.
          </p>
          {error && (
            <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-3 mb-3 text-sm">
              <p className="text-red-200 font-bold mb-1">Error</p>
              <p className="text-red-300">{error}</p>
              {error.includes("OPENAI_API_KEY") && (
                <p className="text-yellow-200 text-xs mt-2">
                  Add your key to <code className="bg-black/30 px-1 rounded">.env.local</code>:
                  {" "}<code className="bg-black/30 px-1 rounded">OPENAI_API_KEY=sk-...</code>
                </p>
              )}
            </div>
          )}
          <button
            onClick={transcribe}
            disabled={loading}
            className="px-5 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition disabled:opacity-50 text-sm"
          >
            {loading ? "⏳ Transcribing…" : "🎙️ Generate Transcript"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Lesson Viewer ─────────────────────────────────────────────────────────────
const PAGE_LABELS: Record<number, string> = {
  0: "對話聽力",
  1: "填詞練習",
  2: "完成句子",
  3: "材料閱讀",
  4: "短文閱讀",
  5: "主題詞語",
  6: "補充練習",
  7: "進階閱讀",
};

function LessonViewer({ lesson, onBack }: { lesson: B1Lesson; onBack: () => void }) {
  const pages = Array.from({ length: lesson.pages }, (_, i) => lesson.startPage + i);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  return (
    <div>
      <button onClick={onBack} className="text-white hover:text-gray-200 mb-5 inline-flex items-center gap-2 text-sm">
        ← Back to Lessons
      </button>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
          <span>Unit {lesson.unit}</span><span>·</span>
          <span>Lesson {lesson.id}</span><span>·</span>
          <span>B1 TOCFL</span>
        </div>
        <h2 className="text-2xl font-bold text-white">{lesson.topic}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: audio + transcript */}
        <div className="lg:col-span-2 space-y-4">
          {lesson.audioFile ? (
            <>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wide">🎧 Listening Audio</p>
              <AudioWithTranscript audioFile={lesson.audioFile} />
            </>
          ) : (
            <div className="bg-white/10 rounded-2xl p-4 text-white/40 text-sm">
              No audio file for this lesson.
            </div>
          )}
        </div>

        {/* Right: PDF page + nav */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/b1-pages/p${pages[currentPageIdx]}.jpg`}
              alt={`Page ${pages[currentPageIdx]}`}
              className="w-full"
            />
          </div>

          {/* Page nav pills */}
          <div className="flex flex-wrap gap-2">
            {pages.map((pageNum, idx) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPageIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  idx === currentPageIdx
                    ? "bg-yellow-400 text-gray-900"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {PAGE_LABELS[idx] ?? `p.${pageNum}`}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setCurrentPageIdx((i) => Math.max(0, i - 1))}
              disabled={currentPageIdx === 0}
              className="px-4 py-2 rounded-xl bg-white/15 text-white text-sm hover:bg-white/25 transition disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="flex-1 text-center text-white/50 text-xs self-center">
              p.{pages[currentPageIdx]} ({currentPageIdx + 1}/{pages.length})
            </span>
            <button
              onClick={() => setCurrentPageIdx((i) => Math.min(pages.length - 1, i + 1))}
              disabled={currentPageIdx === pages.length - 1}
              className="px-4 py-2 rounded-xl bg-white/15 text-white text-sm hover:bg-white/25 transition disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Unit Section ──────────────────────────────────────────────────────────────
function UnitSection({ unit, onSelect }: { unit: B1Unit; onSelect: (l: B1Lesson) => void }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white text-lg shrink-0">
          {unit.unit}
        </div>
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wide">Unit {unit.unit}</p>
          <h3 className="text-white font-bold text-lg leading-tight">{unit.title}</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {unit.lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelect(lesson)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-4 text-left transition group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-yellow-300 font-bold text-sm">{lesson.id}</span>
              <div className="flex gap-1">
                {lesson.audioFile && (
                  <span className="text-xs bg-green-500/30 text-green-200 px-2 py-0.5 rounded-full">🎧</span>
                )}
                <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{lesson.pages}p</span>
              </div>
            </div>
            <p className="text-white text-sm leading-snug">{lesson.topic}</p>
            <p className="text-white/30 text-xs mt-2 group-hover:text-white/50 transition">
              p.{lesson.startPage}–{lesson.startPage + lesson.pages - 1} →
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function B1BookPage() {
  const [selected, setSelected] = useState<B1Lesson | null>(null);

  if (selected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <LessonViewer lesson={selected} onBack={() => setSelected(null)} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-white hover:text-gray-200 mb-6 inline-block text-sm">
          ← Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">📗</div>
          <div>
            <h1 className="text-3xl font-bold text-white">華語文能力測驗關鍵詞彙</h1>
            <p className="text-white/60">B1 進階篇 · 10 Units · 29 Lessons · Reading & Listening</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-8 grid grid-cols-4 text-center">
          {[["10","Units"],["29","Lessons"],["186","Pages"],["25","Audio"]].map(([n,l]) => (
            <div key={l}>
              <div className="text-2xl font-bold text-yellow-300">{n}</div>
              <div className="text-white/50 text-xs">{l}</div>
            </div>
          ))}
        </div>

        {B1_UNITS.map((unit) => (
          <UnitSection key={unit.unit} unit={unit} onSelect={setSelected} />
        ))}
      </div>
    </main>
  );
}
