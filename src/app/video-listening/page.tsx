"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { VIDEO_EPISODES, SHOWS, getEpisodesByShow } from "@/data/videoLessons";
import type { VideoEpisode, TranscriptLine } from "@/data/videoLessons";
import { addXP, addCompletedLesson } from "@/lib/storage";

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

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ── Transcript Panel ──────────────────────────────────────────────────────────
function TranscriptPanel({
  transcript,
  currentTime,
  showPinyin,
  showEnglish,
  onSeek,
}: {
  transcript: TranscriptLine[];
  currentTime: number;
  showPinyin: boolean;
  showEnglish: boolean;
  onSeek: (t: number) => void;
}) {
  const activeRef = useRef<HTMLDivElement>(null);

  const activeIdx = transcript.findIndex(
    (l) => currentTime >= l.start && currentTime < l.end
  );

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeIdx]);

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
                ? "bg-yellow-50 border-yellow-400 shadow-md"
                : "bg-white border-transparent hover:border-blue-200 hover:bg-blue-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`text-xs font-mono mt-1 shrink-0 ${
                  isActive ? "text-yellow-600 font-bold" : "text-gray-300"
                }`}
              >
                {fmtTime(line.start)}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-lg leading-snug font-medium ${
                    isActive ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {line.chinese}
                </p>
                {showPinyin && (
                  <p className="text-sm text-purple-500 mt-0.5 leading-snug">
                    {line.pinyin}
                  </p>
                )}
                {showEnglish && (
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug italic">
                    {line.english}
                  </p>
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
function QuizPanel({
  episode,
  onDone,
}: {
  episode: VideoEpisode;
  onDone: () => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

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
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
        <div className="text-5xl mb-3">{pct >= 70 ? "🏆" : "📚"}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">
          {pct >= 70 ? "Great listening!" : "Keep practicing!"}
        </h3>
        <p className="text-gray-500 mb-5">
          {score}/{episode.questions.length} correct ({pct}%)
        </p>
        <button
          onClick={onDone}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition"
        >
          Watch Another Episode →
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-white/70 mb-3">
        Question {qIdx + 1} / {episode.questions.length}
      </p>
      <div className="bg-white rounded-2xl p-5 shadow-xl mb-4">
        <p className="text-lg font-bold text-gray-800">{q.question}</p>
      </div>
      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => {
          let cls =
            "p-4 rounded-xl text-left border-2 font-medium transition text-base ";
          if (selected === null) {
            cls += "bg-white border-white hover:border-blue-400 hover:bg-blue-50 text-gray-800";
          } else if (i === q.answer) {
            cls += "bg-green-100 border-green-500 text-green-800";
          } else if (i === selected) {
            cls += "bg-red-100 border-red-400 text-red-700";
          } else {
            cls += "bg-white/60 border-white/30 text-gray-400";
          }
          return (
            <button key={i} onClick={() => pick(i)} className={cls}>
              <span className="font-bold mr-2 text-gray-400">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Episode Player ────────────────────────────────────────────────────────────
function EpisodePlayer({
  episode,
  onBack,
}: {
  episode: VideoEpisode;
  onBack: () => void;
}) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showVocab, setShowVocab] = useState(false);
  const [phase, setPhase] = useState<"watch" | "quiz">("watch");
  const [ytReady, setYtReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!episode.youtubeId) return;

    function init() {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: episode.youtubeId,
        playerVars: { rel: 0, modestbranding: 1, cc_load_policy: 0 },
        events: {
          onReady: () => setYtReady(true),
        },
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

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [episode.youtubeId]);

  // Poll current time
  useEffect(() => {
    if (!ytReady) return;
    timerRef.current = setInterval(() => {
      const t = playerRef.current?.getCurrentTime() ?? 0;
      setCurrentTime(t);
    }, 300);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ytReady]);

  function seekTo(t: number) {
    playerRef.current?.seekTo(t, true);
    playerRef.current?.playVideo();
  }

  const noVideo = !episode.youtubeId;

  return (
    <div>
      <button onClick={onBack} className="text-white hover:text-gray-200 mb-5 inline-block">
        ← Back to Episodes
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">{episode.titleZh}</h2>
          <p className="text-white/60 text-sm">
            {episode.showNameZh} · {episode.episode} · Level {episode.level}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Video + Controls */}
        <div>
          {noVideo ? (
            <div className="bg-gray-900 rounded-2xl aspect-video flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-4">📺</div>
              <p className="text-white font-bold text-lg mb-2">YouTube ID not set</p>
              <p className="text-gray-400 text-sm max-w-xs">
                Open <code className="text-yellow-400">src/data/videoLessons.ts</code> and
                replace the empty <code className="text-yellow-400">youtubeId</code> field
                for <strong className="text-white">{episode.titleZh}</strong> with a real
                YouTube video ID (e.g. <code className="text-green-400">dQw4w9WgXcQ</code>).
              </p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden aspect-video bg-black">
              <div ref={containerRef} className="w-full h-full" />
            </div>
          )}

          {/* Toggle Controls */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setShowPinyin((v) => !v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                showPinyin
                  ? "bg-purple-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              拼音 Pinyin {showPinyin ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => setShowEnglish((v) => !v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                showEnglish
                  ? "bg-teal-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              English {showEnglish ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => setShowVocab((v) => !v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                showVocab
                  ? "bg-yellow-500 text-gray-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              📖 Key Vocab
            </button>
            {phase === "watch" && (
              <button
                onClick={() => setPhase("quiz")}
                className="ml-auto px-4 py-2 rounded-xl text-sm font-bold bg-white text-blue-700 hover:bg-blue-50 transition"
              >
                Take Quiz →
              </button>
            )}
          </div>

          {/* Vocab Panel */}
          {showVocab && (
            <div className="bg-white rounded-2xl p-4 mt-4 shadow-lg">
              <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                Key Vocabulary
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {episode.vocab.map((v) => (
                  <div key={v.chinese} className="bg-gray-50 rounded-xl p-2">
                    <p className="font-bold text-gray-800 text-lg leading-tight">{v.chinese}</p>
                    <p className="text-purple-500 text-xs">{v.pinyin}</p>
                    <p className="text-gray-500 text-xs">{v.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Transcript or Quiz */}
        <div>
          {phase === "watch" ? (
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-3">
                Transcript — click any line to jump to that moment
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VideoListeningPage() {
  const [selectedEpisode, setSelectedEpisode] = useState<VideoEpisode | null>(null);
  const [activeShow, setActiveShow] = useState<VideoEpisode["show"]>("womenzheyijia");

  const episodes = getEpisodesByShow(activeShow);
  const show = SHOWS.find((s) => s.id === activeShow)!;

  if (selectedEpisode) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <EpisodePlayer
            episode={selectedEpisode}
            onBack={() => setSelectedEpisode(null)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-white hover:text-gray-200 mb-6 inline-block">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            🎬
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Video Listening</h1>
            <p className="text-white/70">Watch episodes with Chinese transcript + pinyin</p>
          </div>
        </div>

        {/* How to add videos notice */}
        {VIDEO_EPISODES.every((e) => !e.youtubeId) && (
          <div className="bg-yellow-400/20 border border-yellow-300/50 rounded-2xl p-4 mb-6 flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-yellow-100 font-bold text-sm mb-1">Add YouTube videos to enable playback</p>
              <p className="text-yellow-200/80 text-xs">
                Open <code className="bg-black/20 px-1 rounded">src/data/videoLessons.ts</code> and fill in the{" "}
                <code className="bg-black/20 px-1 rounded">youtubeId</code> field for each episode.
                Find clips on YouTube, copy the video ID from the URL, and paste it in.
                All transcripts, pinyin, and quiz questions are ready to use.
              </p>
            </div>
          </div>
        )}

        {/* Show Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {SHOWS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveShow(s.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition ${
                activeShow === s.id
                  ? `bg-gradient-to-r ${s.color} text-white shadow-lg`
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.nameZh}</span>
              <span className="text-xs opacity-75 font-normal hidden sm:inline">
                {s.nameEn}
              </span>
            </button>
          ))}
        </div>

        {/* Show Info */}
        <div className={`bg-gradient-to-r ${show.color} rounded-2xl p-5 mb-6`}>
          <div className="flex items-start gap-3">
            <span className="text-4xl">{show.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {show.nameZh} <span className="text-white/70 text-base font-normal">({show.nameEn})</span>
              </h2>
              <span className="inline-block text-xs bg-white/25 text-white px-2 py-0.5 rounded-full mb-2">
                Level {show.level}
              </span>
              <p className="text-white/80 text-sm">{show.description}</p>
            </div>
          </div>
        </div>

        {/* Episode Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {episodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => setSelectedEpisode(ep)}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                  {ep.episode}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  ep.youtubeId
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {ep.youtubeId ? "▶ Ready" : "⚙ Needs ID"}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-0.5">{ep.titleZh}</h3>
              <p className="text-gray-400 text-sm mb-3">{ep.title}</p>
              <p className="text-gray-500 text-sm leading-snug mb-4">{ep.description}</p>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>🎬 {ep.transcript.length} lines</span>
                <span>📖 {ep.vocab.length} vocab</span>
                <span>❓ {ep.questions.length} questions</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
