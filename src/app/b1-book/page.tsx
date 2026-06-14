"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { B1_UNITS, type B1Lesson, type B1Unit } from "@/data/b1Book";

function AudioPlayer({ audioFile }: { audioFile: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime);
    const onDur = () => { setDuration(a.duration); setLoaded(true); };
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

  function fmt(s: number) {
    if (!isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  }

  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
      <audio ref={audioRef} src={`/audio/b1/${audioFile}.mp3`} preload="metadata" />
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center font-bold text-lg hover:bg-yellow-300 transition shrink-0"
        >
          {playing ? "⏸" : "▶"}
        </button>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={seek}
            className="w-full accent-yellow-400"
          />
          <div className="flex justify-between text-xs text-white/60 mt-0.5">
            <span>{fmt(currentTime)}</span>
            <span>{loaded ? fmt(duration) : "..."}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonViewer({ lesson, onBack }: { lesson: B1Lesson; onBack: () => void }) {
  const pages = Array.from({ length: lesson.pages }, (_, i) => lesson.startPage + i);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  const currentPage = pages[currentPageIdx];

  return (
    <div>
      <button onClick={onBack} className="text-white hover:text-gray-200 mb-5 inline-flex items-center gap-2 text-sm">
        ← Back to Lessons
      </button>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
          <span>Unit {lesson.unit}</span>
          <span>·</span>
          <span>Lesson {lesson.id}</span>
          <span>·</span>
          <span>B1 TOCFL</span>
        </div>
        <h2 className="text-2xl font-bold text-white">{lesson.topic}</h2>
      </div>

      {/* Audio Player */}
      {lesson.audioFile && (
        <div className="mb-5">
          <p className="text-white/60 text-xs font-bold uppercase tracking-wide mb-2">🎧 Listening Audio</p>
          <AudioPlayer audioFile={lesson.audioFile} />
        </div>
      )}

      {/* Page viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page image */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/b1-pages/p${currentPage}.jpg`}
              alt={`Page ${currentPage}`}
              className="w-full"
            />
          </div>
        </div>

        {/* Page nav */}
        <div className="flex flex-col gap-3">
          <p className="text-white/60 text-xs font-bold uppercase tracking-wide">Pages</p>
          {pages.map((pageNum, idx) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPageIdx(idx)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-sm font-medium ${
                idx === currentPageIdx
                  ? "bg-yellow-400 text-gray-900"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="font-mono text-xs opacity-60">p.{pageNum}</span>
              <span>
                {idx === 0 && "對話聽力"}
                {idx === 1 && "填詞練習"}
                {idx === 2 && "完成句子"}
                {idx === 3 && "材料閱讀"}
                {idx === 4 && "短文閱讀"}
                {idx === 5 && "主題詞語"}
                {idx === 6 && "補充練習"}
                {idx === 7 && "進階閱讀"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Prev / Next page buttons */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => setCurrentPageIdx((i) => Math.max(0, i - 1))}
          disabled={currentPageIdx === 0}
          className="px-5 py-2 rounded-xl bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition disabled:opacity-30"
        >
          ← Previous
        </button>
        <span className="flex-1 text-center text-white/60 text-sm self-center">
          Page {currentPageIdx + 1} / {pages.length}
        </span>
        <button
          onClick={() => setCurrentPageIdx((i) => Math.min(pages.length - 1, i + 1))}
          disabled={currentPageIdx === pages.length - 1}
          className="px-5 py-2 rounded-xl bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function UnitSection({ unit, onSelect }: { unit: B1Unit; onSelect: (l: B1Lesson) => void }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white text-lg">
          {unit.unit}
        </div>
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wide">Unit {unit.unit}</p>
          <h3 className="text-white font-bold text-lg">{unit.title}</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-13">
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
                  <span className="text-xs bg-green-500/30 text-green-200 px-2 py-0.5 rounded-full">🎧 Audio</span>
                )}
                <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{lesson.pages}p</span>
              </div>
            </div>
            <p className="text-white text-sm leading-snug">{lesson.topic}</p>
            <p className="text-white/40 text-xs mt-2 group-hover:text-white/60 transition">
              p.{lesson.startPage}–{lesson.startPage + lesson.pages - 1} →
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function B1BookPage() {
  const [selected, setSelected] = useState<B1Lesson | null>(null);

  if (selected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 py-8 px-4">
        <div className="max-w-5xl mx-auto">
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
            <p className="text-white/70">B1 進階篇 · 10 Units · 29 Lessons · Reading & Listening</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-8 flex gap-6 text-center">
          <div className="flex-1">
            <div className="text-2xl font-bold text-yellow-300">10</div>
            <div className="text-white/60 text-xs">Units</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-yellow-300">29</div>
            <div className="text-white/60 text-xs">Lessons</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-yellow-300">186</div>
            <div className="text-white/60 text-xs">Pages</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-yellow-300">25</div>
            <div className="text-white/60 text-xs">Audio files</div>
          </div>
        </div>

        {B1_UNITS.map((unit) => (
          <UnitSection key={unit.unit} unit={unit} onSelect={setSelected} />
        ))}
      </div>
    </main>
  );
}
