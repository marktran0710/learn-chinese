"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { loadCompletedLessons, loadCustomWords } from "@/lib/storage";

export default function ProgressPage() {
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
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-8">
      <div className="container">
        <Link
          href="/"
          className="text-white hover:text-gray-200 mb-8 inline-block text-lg"
        >
          ← Back to Home
        </Link>

        <h1 className="text-5xl font-bold text-white mb-8">📊 Your Progress</h1>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-4xl font-bold text-blue-600">
              {totalLessons}
            </div>
            <p className="text-gray-600">Lessons Completed</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-purple-600">
              {Math.min(totalLessons, 30)}
            </div>
            <p className="text-gray-600">Day Streak</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-pink-600">{xpPoints}</div>
            <p className="text-gray-600">XP Points</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-green-600">
              {
                achievements.filter(
                  (item) => item.description.includes("unlock") === false,
                ).length
              }
            </div>
            <p className="text-gray-600">Achievements</p>
          </div>
        </div>

        {/* Skill Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.skill} className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {stat.skill}
                </h3>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {stat.lessons}
                </span>
              </div>
              <ProgressBar progress={stat.progress} />
              <div className="mt-4 text-sm text-gray-600">
                🔥 {stat.streak} | Last activity: Today
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">
            🏆 Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="card text-center opacity-75 hover:opacity-100 transition"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h4 className="font-bold text-gray-800 mb-1">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600">
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
