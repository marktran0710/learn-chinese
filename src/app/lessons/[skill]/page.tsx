"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PronunciationPlayer } from "@/lib/pronunciation";
import {
  addCompletedLesson,
  loadCompletedLessons,
  saveLastActiveSkill,
} from "@/lib/storage";

interface LessonData {
  id: string;
  title: string;
  chinese: string;
  pinyin: string;
  meaning: string;
  example?: string;
}

const lessonsData: Record<string, LessonData[]> = {
  reading: [
    {
      id: "1",
      title: "Basic Characters (1-10)",
      chinese: "一",
      pinyin: "yī",
      meaning: "one",
    },
    { id: "2", title: "Numbers", chinese: "二", pinyin: "èr", meaning: "two" },
    {
      id: "3",
      title: "Common Phrases",
      chinese: "你好",
      pinyin: "nǐ hǎo",
      meaning: "hello",
    },
  ],
  writing: [
    {
      id: "1",
      title: "Stroke Order Basics",
      chinese: "木",
      pinyin: "mù",
      meaning: "wood",
    },
    {
      id: "2",
      title: "Radicals",
      chinese: "火",
      pinyin: "huǒ",
      meaning: "fire",
    },
    {
      id: "3",
      title: "Complex Characters",
      chinese: "龍",
      pinyin: "lóng",
      meaning: "dragon",
    },
  ],
  listening: [
    {
      id: "1",
      title: "Tones Introduction",
      chinese: "媽",
      pinyin: "mā",
      meaning: "mother",
    },
    {
      id: "2",
      title: "Tone Practice",
      chinese: "麻",
      pinyin: "má",
      meaning: "hemp",
    },
    {
      id: "3",
      title: "Word Recognition",
      chinese: "馬",
      pinyin: "mǎ",
      meaning: "horse",
    },
  ],
  speaking: [
    {
      id: "1",
      title: "Pronunciation Basics",
      chinese: "哈",
      pinyin: "hā",
      meaning: "ha",
    },
    {
      id: "2",
      title: "Conversation Starters",
      chinese: "謝謝",
      pinyin: "xièxiè",
      meaning: "thank you",
    },
    {
      id: "3",
      title: "Daily Phrases",
      chinese: "對不起",
      pinyin: "duìbùqǐ",
      meaning: "sorry",
    },
  ],
};

export default function LessonsPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const resolvedParams =
    params instanceof Promise ? params : Promise.resolve(params);
  const [skill, setSkill] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    const storedLessons = loadCompletedLessons();
    setCompleted(new Set(storedLessons));
  }, []);

  useEffect(() => {
    resolvedParams.then((p) => {
      if (skill !== p.skill) {
        setSkill(p.skill);
      }
    });
  }, [resolvedParams, skill]);

  useEffect(() => {
    if (!skill) return;
    saveLastActiveSkill(skill);
    const currentLessons = lessonsData[skill] || [];
    if (currentLessons.length > 0) {
      setSelectedLesson(currentLessons[0]);
    }
  }, [skill]);

  const skillTitles: Record<string, string> = {
    reading: "📖 Reading",
    writing: "✍️ Writing",
    listening: "👂 Listening",
    speaking: "🗣️ Speaking",
  };

  const lessons = lessonsData[skill] || [];
  const skillTitle = skillTitles[skill] || "Learning";

  const getCompletionKey = (lessonId: string) => `${skill}-${lessonId}`;

  const handleCompleteLesson = (lessonId: string) => {
    const completionKey = getCompletionKey(lessonId);
    const updated = addCompletedLesson(completionKey);
    setCompleted(new Set(updated));
  };

  const isCompleted = (lessonId: string) => {
    return completed.has(getCompletionKey(lessonId));
  };

  const handlePlayAudio = (audioKey: string, text: string) => {
    if (playingAudio === audioKey) {
      PronunciationPlayer.stopSpeaking();
      setPlayingAudio(null);
    } else {
      PronunciationPlayer.speak(text, "zh-CN");
      setPlayingAudio(audioKey);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-8">
      <div className="container">
        {/* Back Button */}
        <Link
          href="/"
          className="text-white hover:text-gray-200 mb-8 inline-block text-lg"
        >
          ← Back to Home
        </Link>

        <h1 className="text-5xl font-bold text-white mb-8">
          {skillTitle} Lessons
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Lessons</h2>
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full p-4 rounded-lg text-left transition ${
                      selectedLesson?.id === lesson.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    } ${isCompleted(lesson.id) ? "border-l-4 border-green-500" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{lesson.title}</span>
                      {completed.has(lesson.id) && (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="card">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">
                  {selectedLesson.title}
                </h2>

                {/* Character Display */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-xl mb-6 text-center">
                  <div className="text-7xl font-bold text-gray-800 mb-4">
                    {selectedLesson.chinese}
                  </div>
                  <div className="text-2xl text-purple-600 font-semibold mb-2">
                    {selectedLesson.pinyin}
                  </div>
                  <div className="text-xl text-gray-600 mb-4">
                    {selectedLesson.meaning}
                  </div>
                  {/* Quick Audio Buttons */}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() =>
                        handlePlayAudio(
                          `quick-listen-${selectedLesson.id}`,
                          selectedLesson.chinese,
                        )
                      }
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        playingAudio === `quick-listen-${selectedLesson.id}`
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {playingAudio === `quick-listen-${selectedLesson.id}`
                        ? "⏹️"
                        : "🔊"}
                    </button>
                  </div>
                </div>

                {/* Learning Content */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    How to {selectedLesson.title.split(" ")[0].toLowerCase()}:
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>✓ Observe the character structure and breakdown</li>
                    <li>✓ Learn the pronunciation and tone</li>
                    <li>✓ Practice writing the strokes in order</li>
                    <li>✓ Use in context with example sentences</li>
                  </ul>
                </div>

                {/* Interactive Elements */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() =>
                      handlePlayAudio(
                        `listen-${selectedLesson.id}`,
                        selectedLesson.chinese,
                      )
                    }
                    className={`py-3 rounded-lg font-semibold transition ${
                      playingAudio === `listen-${selectedLesson.id}`
                        ? "bg-red-600 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {playingAudio === `listen-${selectedLesson.id}`
                      ? "⏹️ Stop Listen"
                      : "🎵 Listen"}
                  </button>
                  <button
                    onClick={() =>
                      handlePlayAudio(
                        `speak-${selectedLesson.id}`,
                        selectedLesson.chinese,
                      )
                    }
                    className={`py-3 rounded-lg font-semibold transition ${
                      playingAudio === `speak-${selectedLesson.id}`
                        ? "bg-red-600 text-white"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {playingAudio === `speak-${selectedLesson.id}`
                      ? "⏹️ Stop Speaking"
                      : "🗣️ Speak"}
                  </button>
                  <button className="btn btn-secondary">
                    📝 Practice Writing
                  </button>
                  <button className="btn btn-secondary">
                    📚 More Examples
                  </button>
                </div>

                {/* Complete Button */}
                <button
                  onClick={() => handleCompleteLesson(selectedLesson.id)}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition ${
                    completed.has(selectedLesson.id)
                      ? "bg-green-500 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {completed.has(selectedLesson.id)
                    ? "✓ Completed"
                    : "✓ Mark as Complete"}
                </button>
              </div>
            ) : (
              <div className="card h-64 flex items-center justify-center">
                <p className="text-gray-500 text-xl">
                  Select a lesson to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
