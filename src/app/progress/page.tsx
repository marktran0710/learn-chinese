"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { loadCompletedLessons, loadCustomWords } from "@/lib/storage";
import { useTheme } from "@/lib/theme";

export default function ProgressPage() {
  const { theme, toggle } = useTheme();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const lessons = loadCompletedLessons();
    setCompletedLessons(lessons);
    setWordCount(loadCustomWords().length);
  }, []);

  const countForSkill = (skill: string, total: number) => {
    const count = completedLessons.filter((item) =>
      item.startsWith(`${skill}-`),
    ).length;
    return {
      skill,
      progress: total === 0 ? 0 : Math.round((count / total) * 100),
      lessons: `${count}/${total}`,
      streak: `${Math.min(count, 12)} days`,
    };
  };

  const stats = [
    countForSkill("reading", 25),
    countForSkill("writing", 25),
    countForSkill("listening", 20),
    countForSkill("speaking", 20),
  ];

  const totalLessons = completedLessons.length;
  const xpPoints = totalLessons * 15 + wordCount * 5;
  const achievements = [
    {
      icon: "🌟",
      title: "First Step",
      description:
        totalLessons > 0
          ? "You completed your first lesson"
          : "Complete your first lesson",
    },
    {
      icon: "🔥",
      title: "5-Day Streak",
      description:
        totalLessons >= 5
          ? "Practice for 5 consecutive days"
          : "Complete 5 lessons to unlock",
    },
    {
      icon: "⭐",
      title: "Speed Reader",
      description:
        stats[0].progress >= 40
          ? "Complete 10 reading lessons"
          : "Finish more reading lessons",
    },
    {
      icon: "🎯",
      title: "All-Rounder",
      description: stats.every((item) => item.progress >= 20)
        ? "Complete lessons in all 4 skills"
        : "Try every skill to unlock",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur border-b border-gray-200 dark:border-white/[0.06] px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">← Home</Link>
        <h1 className="font-bold text-sm">📊 Progress</h1>
        <button onClick={toggle} className="text-lg">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="container py-8">
        <h2 className="text-4xl font-bold mb-8">📊 Your Progress</h2>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 text-center shadow-sm">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {totalLessons}
            </div>
            <p className="text-gray-600 dark:text-white/60">Lessons Completed</p>
          </div>
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 text-center shadow-sm">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {Math.min(totalLessons, 30)}
            </div>
            <p className="text-gray-600 dark:text-white/60">Day Streak</p>
          </div>
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 text-center shadow-sm">
            <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">{xpPoints}</div>
            <p className="text-gray-600 dark:text-white/60">XP Points</p>
          </div>
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 text-center shadow-sm">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              {
                achievements.filter(
                  (item) => item.description.includes("unlock") === false,
                ).length
              }
            </div>
            <p className="text-gray-600 dark:text-white/60">Achievements</p>
          </div>
        </div>

        {/* Skill Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.skill} className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white capitalize">
                  {stat.skill}
                </h3>
                <span className="text-sm bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                  {stat.lessons}
                </span>
              </div>
              <ProgressBar progress={stat.progress} />
              <div className="mt-4 text-sm text-gray-600 dark:text-white/60">
                🔥 {stat.streak} | Last activity: Today
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-3xl font-bold mb-6">
            🏆 Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 text-center opacity-75 hover:opacity-100 transition shadow-sm"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
