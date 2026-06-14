"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { VideoEpisode, TranscriptLine } from "@/data/videoLessons";
import {
  loadCustomEpisodes, saveCustomEpisode, deleteCustomEpisode,
  addXP, addCompletedLesson,
} from "@/lib/storage";
import { useTheme } from "@/lib/theme";

// ── YouTube IFrame API types ──────────────────────────────────────────────────
declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}
interface YTPlayer {
  getCurrentTime: () => number;
  seekTo: (s: number, allowSeek: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  destroy: () => void;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function fmtDuration(s: number) {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ── Add Video Panel ───────────────────────────────────────────────────────────
type ProgressEvent =
  | { step: "info"; message: string }
  | { step: "info_done"; title: string; duration: number; thumbnailUrl: string }
  | { step: "captions"; message: string }
  | { step: "captions_done"; lineCount: number }
  | { step: "downloading"; message: string }
  | { step: "transcribing"; message: string }
  | { step: "transcribing_done"; lineCount: number }
  | { step: "enhancing"; message: string }
  | { step: "warn"; message: string }
  | { step: "done"; episode: VideoEpisode }
  | { step: "error"; message: string };

function AddVideoPanel({ onSaved }: { onSaved: (ep: VideoEpisode) => void }) {
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const STEP_LABELS: Record<string, string> = {
    info: "📋 Fetching video info",
    info_done: "✅ Video info ready",
    captions: "📝 Checking for captions",
    captions_done: "✅ Captions found",
    downloading: "⬇️ Downloading audio",
    transcribing: "🎙️ Transcribing with Whisper",
    transcribing_done: "✅ Transcription done",
    enhancing: "🤖 Claude: adding pinyin + translations",
    warn: "⚠️",
    done: "🎉 Processing complete!",
    error: "❌ Error",
  };

  async function process() {
    if (!url.trim()) return;
    setRunning(true);
    setLogs([]);
    setError("");
    setDone(false);

    try {
      const res = await fetch("/api/process-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok || !res.body) {
        setError("Server error — check the console.");
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const ev = JSON.parse(part.slice(6)) as ProgressEvent;
          const label = STEP_LABELS[ev.step] ?? ev.step;

          if (ev.step === "error") {
            setError((ev as { step: "error"; message: string }).message);
          } else if (ev.step === "done") {
            const ep = (ev as { step: "done"; episode: VideoEpisode }).episode;
            saveCustomEpisode(ep);
            onSaved(ep);
            setDone(true);
            setLogs((l) => [...l, label]);
          } else if (ev.step === "warn") {
            setLogs((l) => [...l, `${label} ${(ev as { step: "warn"; message: string }).message}`]);
          } else if (ev.step === "info_done") {
            const e = ev as { step: "info_done"; title: string };
            setLogs((l) => [...l, `${label}: ${e.title}`]);
          } else if (ev.step === "captions_done") {
            const e = ev as { step: "captions_done"; lineCount: number };
            setLogs((l) => [...l, `${label} (${e.lineCount} lines)`]);
          } else if (ev.step === "transcribing_done") {
            const e = ev as { step: "transcribing_done"; lineCount: number };
            setLogs((l) => [...l, `${label} (${e.lineCount} segments)`]);
          } else {
            const msg = (ev as { message?: string }).message;
            setLogs((l) => [...l, msg ? `${label}: ${msg}` : label]);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">➕ Add a YouTube Video</h2>
      <p className="text-gray-500 dark:text-white/60 text-sm mb-4">
        Paste any YouTube link. We'll fetch captions or download & transcribe the audio, then
        Claude adds pinyin, English, vocabulary & quiz questions automatically.
      </p>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !running && process()}
          disabled={running}
          className="flex-1 bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
        />
        <button
          onClick={process}
          disabled={running || !url.trim()}
          className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition disabled:opacity-50 whitespace-nowrap"
        >
          {running ? "Processing…" : "Process Video"}
        </button>
      </div>

      {/* Progress log */}
      {logs.length > 0 && (
        <div className="bg-gray-900 dark:bg-black/40 rounded-xl p-4 text-sm font-mono space-y-1 max-h-48 overflow-y-auto">
          {logs.map((l, i) => (
            <div key={i} className="text-green-400">{l}</div>
          ))}
          {running && (
            <div className="text-yellow-300 animate-pulse">⏳ Working…</div>
          )}
          <div ref={logsEndRef} />
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-400/40 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-200 text-sm font-bold mb-1">Error</p>
          <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          {error.includes("OPENAI_API_KEY") && (
            <p className="text-orange-600 dark:text-yellow-200 text-xs mt-2">
              Add your OpenAI key to <code className="bg-gray-100 dark:bg-black/30 px-1 rounded">.env.local</code>:
              &nbsp;<code className="bg-gray-100 dark:bg-black/30 px-1 rounded">OPENAI_API_KEY=sk-...</code>
            </p>
          )}
          {error.includes("ANTHROPIC") && (
            <p className="text-orange-600 dark:text-yellow-200 text-xs mt-2">
              Add your Anthropic key to <code className="bg-gray-100 dark:bg-black/30 px-1 rounded">.env.local</code>:
              &nbsp;<code className="bg-gray-100 dark:bg-black/30 px-1 rounded">ANTHROPIC_API_KEY=sk-ant-...</code>
            </p>
          )}
        </div>
      )}

      {done && (
        <div className="mt-3 bg-green-50 dark:bg-green-500/20 border border-green-200 dark:border-green-400/40 rounded-xl p-3 text-green-700 dark:text-green-200 text-sm font-bold">
          ✅ Video added! Scroll down to find it in your library.
        </div>
      )}
    </div>
  );
}

// ── Transcript Panel ──────────────────────────────────────────────────────────
function TranscriptPanel({
  transcript, currentTime, showPinyin, showEnglish, onSeek,
}: {
  transcript: TranscriptLine[];
  currentTime: number;
  showPinyin: boolean;
  showEnglish: boolean;
  onSeek: (t: number) => void;
}) {
  const activeRef = useRef<HTMLDivElement>(null);
  const activeIdx = transcript.findIndex((l) => currentTime >= l.start && currentTime < l.end);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeIdx]);

  if (!transcript.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-white/40 text-sm">
        No transcript available for this video.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-[520px] pr-1">
      {transcript.map((line, i) => {
        const isActive = i === activeIdx;
        return (
          <div
            key={i}
            ref={isActive ? activeRef : null}
            onClick={() => onSeek(line.start)}
            className={`rounded-xl px-4 py-3 cursor-pointer transition-all border-2 ${
              isActive
                ? "bg-yellow-50 dark:bg-yellow-400/10 border-yellow-400 shadow-md"
                : "bg-white dark:bg-white/[0.03] border-transparent hover:border-blue-200 dark:hover:border-white/[0.1] hover:bg-gray-50 dark:hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`text-xs font-mono mt-1 shrink-0 ${isActive ? "text-yellow-600 font-bold" : "text-gray-300 dark:text-white/25"}`}>
                {fmtTime(line.start)}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-lg leading-snug font-medium ${isActive ? "text-gray-900" : "text-gray-700 dark:text-white"}`}>
                  {line.chinese}
                </p>
                {showPinyin && line.pinyin && (
                  <p className="text-sm text-purple-500 dark:text-purple-400 mt-0.5 leading-snug">{line.pinyin}</p>
                )}
                {showEnglish && line.english && (
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5 leading-snug italic">{line.english}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Quiz Panel ────────────────────────────────────────────────────────────────
function QuizPanel({ episode, onDone }: { episode: VideoEpisode; onDone: () => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!episode.questions?.length) {
    return (
      <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 text-center">
        <p className="text-gray-500 dark:text-white/50">No quiz questions generated for this video.</p>
        <button onClick={onDone} className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600">
          Back
        </button>
      </div>
    );
  }

  const q = episode.questions[qIdx];

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === q.answer;
    if (correct) setScore((s) => s + 1);
    addXP(correct ? 15 : 5);
    addCompletedLesson(`video-${episode.id}-q${qIdx}`);
    setTimeout(() => {
      if (qIdx + 1 >= episode.questions.length) setFinished(true);
      else { setQIdx((n) => n + 1); setSelected(null); }
    }, 900);
  }

  if (finished) {
    const pct = Math.round((score / episode.questions.length) * 100);
    return (
      <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 text-center shadow-xl">
        <div className="text-5xl mb-3">{pct >= 70 ? "🏆" : "📚"}</div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{pct >= 70 ? "Great listening!" : "Keep practicing!"}</h3>
        <p className="text-gray-500 dark:text-white/50 mb-5">{score}/{episode.questions.length} correct ({pct}%)</p>
        <button onClick={onDone} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition">
          ← Back to Video
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-white/70 mb-3">Question {qIdx + 1} / {episode.questions.length}</p>
      <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-xl mb-4">
        <p className="text-lg font-bold text-gray-800 dark:text-white">{q.question}</p>
      </div>
      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => {
          let cls = "p-4 rounded-xl text-left border-2 font-medium transition text-base ";
          if (selected === null) cls += "bg-white dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.1] hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 text-gray-800 dark:text-white";
          else if (i === q.answer) cls += "bg-green-100 dark:bg-green-500/20 border-green-500 text-green-800 dark:text-green-300";
          else if (i === selected) cls += "bg-red-100 dark:bg-red-500/20 border-red-400 text-red-700 dark:text-red-300";
          else cls += "bg-white/60 dark:bg-white/[0.02] border-gray-200 dark:border-white/[0.05] text-gray-400 dark:text-white/30";
          return (
            <button key={i} onClick={() => pick(i)} className={cls}>
              <span className="font-bold mr-2 text-gray-400 dark:text-white/40">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Episode Player ────────────────────────────────────────────────────────────
function EpisodePlayer({ episode, onBack }: { episode: VideoEpisode; onBack: () => void }) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showVocab, setShowVocab] = useState(false);
  const [phase, setPhase] = useState<"watch" | "quiz">("watch");
  const [ytReady, setYtReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!episode.youtubeId) return;

    function init() {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: episode.youtubeId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: { onReady: () => setYtReady(true) },
      });
    }

    if (window.YT?.Player) {
      init();
    } else {
      window.onYouTubeIframeAPIReady = init;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => { playerRef.current?.destroy(); playerRef.current = null; };
  }, [episode.youtubeId]);

  useEffect(() => {
    if (!ytReady) return;
    timerRef.current = setInterval(() => {
      setCurrentTime(playerRef.current?.getCurrentTime() ?? 0);
    }, 300);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [ytReady]);

  function seekTo(t: number) {
    playerRef.current?.seekTo(t, true);
    playerRef.current?.playVideo();
  }

  return (
    <div>
      <button onClick={onBack} className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white mb-5 inline-flex items-center gap-2 transition">
        ← Back to Library
      </button>

      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{episode.titleZh || episode.title}</h2>
        {episode.description && (
          <p className="text-gray-500 dark:text-white/60 text-sm mt-1">{episode.description}</p>
        )}
        <div className="flex gap-3 mt-2 flex-wrap">
          {episode.level && episode.level !== "?" && (
            <span className="text-xs bg-gray-100 dark:bg-white/[0.1] text-gray-600 dark:text-white px-2 py-0.5 rounded-full">Level {episode.level}</span>
          )}
          {episode.duration ? (
            <span className="text-xs bg-gray-100 dark:bg-white/[0.1] text-gray-600 dark:text-white px-2 py-0.5 rounded-full">⏱ {fmtDuration(episode.duration)}</span>
          ) : null}
          <span className="text-xs bg-gray-100 dark:bg-white/[0.1] text-gray-600 dark:text-white px-2 py-0.5 rounded-full">🎬 {episode.transcript.length} lines</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left */}
        <div>
          <div className="rounded-2xl overflow-hidden aspect-video bg-gray-900">
            <div ref={containerRef} className="w-full h-full" />
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setShowPinyin((v) => !v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${showPinyin ? "bg-purple-500 text-white" : "bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/[0.12]"}`}
            >
              拼音 {showPinyin ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => setShowEnglish((v) => !v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${showEnglish ? "bg-teal-500 text-white" : "bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/[0.12]"}`}
            >
              English {showEnglish ? "ON" : "OFF"}
            </button>
            {episode.vocab?.length > 0 && (
              <button
                onClick={() => setShowVocab((v) => !v)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${showVocab ? "bg-yellow-500 text-gray-900" : "bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/[0.12]"}`}
              >
                📖 Vocab
              </button>
            )}
            {phase === "watch" && episode.questions?.length > 0 && (
              <button
                onClick={() => setPhase("quiz")}
                className="ml-auto px-4 py-2 rounded-xl text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition"
              >
                Take Quiz →
              </button>
            )}
          </div>

          {showVocab && episode.vocab?.length > 0 && (
            <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4 mt-4 shadow-lg">
              <h3 className="font-bold text-gray-700 dark:text-white/80 mb-3 text-sm uppercase tracking-wide">Key Vocabulary</h3>
              <div className="grid grid-cols-2 gap-2">
                {episode.vocab.map((v) => (
                  <div key={v.chinese} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-2">
                    <p className="font-bold text-gray-800 dark:text-white text-lg leading-tight">{v.chinese}</p>
                    <p className="text-purple-500 dark:text-purple-400 text-xs">{v.pinyin}</p>
                    <p className="text-gray-500 dark:text-white/50 text-xs">{v.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div>
          {phase === "watch" ? (
            <div className="bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4">
              <p className="text-gray-500 dark:text-white/70 text-xs font-bold uppercase tracking-wide mb-3">
                Transcript — click any line to jump
              </p>
              <TranscriptPanel
                transcript={episode.transcript}
                currentTime={currentTime}
                showPinyin={showPinyin}
                showEnglish={showEnglish}
                onSeek={seekTo}
              />
            </div>
          ) : (
            <QuizPanel episode={episode} onDone={() => setPhase("watch")} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Episode Card ──────────────────────────────────────────────────────────────
function EpisodeCard({
  ep,
  onPlay,
  onDelete,
}: {
  ep: VideoEpisode;
  onPlay: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
      {ep.thumbnailUrl && (
        <div className="relative aspect-video bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={onPlay}
              className="bg-white/90 text-gray-900 font-bold px-5 py-2 rounded-xl text-sm shadow hover:bg-white transition"
            >
              ▶ Watch & Learn
            </button>
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-800 dark:text-white text-base leading-snug line-clamp-2">{ep.titleZh || ep.title}</h3>
          <div className="flex gap-1 shrink-0">
            {ep.level && ep.level !== "?" && (
              <span className="text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg">{ep.level}</span>
            )}
          </div>
        </div>
        {ep.description && (
          <p className="text-gray-500 dark:text-white/50 text-xs leading-snug mb-3 line-clamp-2">{ep.description}</p>
        )}
        <div className="flex gap-3 text-xs text-gray-400 dark:text-white/40 mb-4">
          <span>🎬 {ep.transcript.length} lines</span>
          {ep.vocab?.length > 0 && <span>📖 {ep.vocab.length} vocab</span>}
          {ep.questions?.length > 0 && <span>❓ {ep.questions.length} questions</span>}
          {ep.duration ? <span>⏱ {fmtDuration(ep.duration)}</span> : null}
        </div>
        <div className="flex gap-2">
          {!ep.thumbnailUrl && (
            <button
              onClick={onPlay}
              className="flex-1 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition"
            >
              ▶ Watch & Learn
            </button>
          )}
          {ep.thumbnailUrl && (
            <button
              onClick={onPlay}
              className="flex-1 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition"
            >
              ▶ Watch & Learn
            </button>
          )}
          {confirmDelete ? (
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition"
            >
              Confirm delete
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Remove video"
              className="px-3 py-2 bg-gray-100 dark:bg-white/[0.08] hover:bg-red-50 dark:hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl text-sm transition"
            >
              🗑
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VideoListeningPage() {
  const { theme, toggle } = useTheme();
  const [episodes, setEpisodes] = useState<VideoEpisode[]>([]);
  const [selected, setSelected] = useState<VideoEpisode | null>(null);

  useEffect(() => {
    setEpisodes(loadCustomEpisodes());
  }, []);

  function handleSaved(ep: VideoEpisode) {
    setEpisodes(loadCustomEpisodes());
    setSelected(ep);
  }

  function handleDelete(id: string) {
    deleteCustomEpisode(id);
    setEpisodes(loadCustomEpisodes());
  }

  if (selected) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur border-b border-gray-200 dark:border-white/[0.06] px-4 py-3 flex items-center justify-between gap-4">
          <button onClick={() => setSelected(null)} className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">← Back</button>
          <h1 className="font-bold text-sm">🎬 Video Listening</h1>
          <button onClick={toggle} className="text-lg">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <EpisodePlayer episode={selected} onBack={() => setSelected(null)} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur border-b border-gray-200 dark:border-white/[0.06] px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">← Home</Link>
        <h1 className="font-bold text-sm">🎬 Video Listening</h1>
        <button onClick={toggle} className="text-lg">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-white/[0.08] flex items-center justify-center text-3xl">🎬</div>
          <div>
            <h2 className="text-3xl font-bold">Video Listening</h2>
            <p className="text-gray-500 dark:text-white/70">Add any YouTube video — transcripts & learning content generated automatically</p>
          </div>
        </div>

        <AddVideoPanel onSaved={handleSaved} />

        {episodes.length === 0 ? (
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🎥</div>
            <p className="text-gray-700 dark:text-white font-bold text-lg mb-2">Your video library is empty</p>
            <p className="text-gray-500 dark:text-white/60 text-sm">
              Paste a YouTube link above to get started. Works with any Chinese video —
              captions optional.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-gray-800 dark:text-white font-bold text-lg mb-4">Your Videos ({episodes.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {episodes.map((ep) => (
                <EpisodeCard
                  key={ep.id}
                  ep={ep}
                  onPlay={() => setSelected(ep)}
                  onDelete={() => handleDelete(ep.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
