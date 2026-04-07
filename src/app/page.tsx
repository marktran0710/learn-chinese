"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadCompletedLessons,
  loadCustomWords,
  loadLastActiveSkill,
} from "@/lib/storage";

export default function Home() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [lastSkill, setLastSkill] = useState<string | null>(null);

  useEffect(() => {
    setCompletedLessons(loadCompletedLessons());
    setWordCount(loadCustomWords().length);
    setLastSkill(loadLastActiveSkill());
  }, []);

  const skills = [
    {
      id: "reading",
      name: "🔤 Reading (讀)",
      description: "Learn to recognize and read Traditional Chinese characters",
      icon: "📖",
      lessons: 25,
    },
    {
      id: "writing",
      name: "✍️ Writing (寫)",
      description: "Master writing Traditional Chinese characters correctly",
      icon: "🖊️",
      lessons: 25,
    },
    {
      id: "listening",
      name: "👂 Listening (聽)",
      description: "Develop your listening comprehension skills",
      icon: "🎧",
      lessons: 20,
    },
    {
      id: "speaking",
      name: "🗣️ Speaking (說)",
      description: "Practice pronunciation and conversational skills",
      icon: "📢",
      lessons: 20,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      {/* Navigation */}
      <nav className="bg-white bg-opacity-10 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold text-white">🇹🇼 Learn Chinese</h1>
          <div className="space-x-4">
            <Link
              href="/vocabulary"
              className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition"
            >
              📚 My Words
            </Link>
            <Link
              href="/progress"
              className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition"
            >
              📊 Progress
            </Link>
            <Link
              href="/settings"
              className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition"
            >
              ⚙️ Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-16 text-center">
        <h2 className="text-5xl font-bold text-white mb-4">
          Master Traditional Chinese
        </h2>
        <p className="text-xl text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
          Learn through 4 essential skills: Reading, Writing, Listening, and
          Speaking. Interactive lessons designed for every level.
        </p>
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="text-white text-lg">
            <div>📘 Completed lessons: {completedLessons.length}</div>
            <div>✍️ Saved words: {wordCount}</div>
            {lastSkill && <div>🔁 Last activity: {lastSkill} lessons</div>}
          </div>
          <Link
            href={lastSkill ? `/lessons/${lastSkill}` : "/lessons/reading"}
            className="btn btn-primary text-lg"
          >
            {lastSkill ? "Continue Learning" : "Get Started Now"}
          </Link>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {skills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => setSelectedSkill(skill.id)}
              className="card cursor-pointer transform hover:scale-105 transition-transform duration-300"
            >
              <div className="text-5xl mb-4">{skill.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {skill.name}
              </h3>
              <p className="text-gray-600 mb-4">{skill.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {skill.lessons} lessons
                </span>
                <Link
                  href={`/lessons/${skill.id}`}
                  className="text-blue-600 font-semibold hover:text-blue-800"
                >
                  Start →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Vocabulary Section */}
        <div className="mt-12 card bg-gradient-to-r from-green-400 to-blue-500 text-white">
          <h3 className="text-3xl font-bold mb-3">
            📚 Create Your Custom Vocabulary
          </h3>
          <p className="text-lg mb-6">
            Add words YOU want to learn! Build your personal vocabulary list
            with meanings, pronunciations, and examples.
          </p>
          <Link
            href="/vocabulary"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Manage My Words
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <div className="text-4xl mb-4">📈</div>
            <h4 className="text-xl font-bold mb-2">Track Progress</h4>
            <p className="text-gray-600">
              Monitor your learning journey with detailed statistics and
              insights.
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-xl font-bold mb-2">Personalized Learning</h4>
            <p className="text-gray-600">
              Lessons adapted to your level and learning pace.
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">🏆</div>
            <h4 className="text-xl font-bold mb-2">Achievements</h4>
            <p className="text-gray-600">
              Unlock badges and rewards as you progress through lessons.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white bg-opacity-10 backdrop-blur-md mt-20 py-8">
        <div className="container text-center text-white">
          <p>&copy; 2026 Learn Traditional Chinese. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
