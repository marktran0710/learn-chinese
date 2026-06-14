"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/lib/theme";

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("english");
  const [difficulty, setDifficulty] = useState("intermediate");

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-white">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur border-b border-gray-200 dark:border-white/[0.06] px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">← Home</Link>
        <h1 className="font-bold text-sm">⚙️ Settings</h1>
        <button onClick={toggle} className="text-lg">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="container max-w-2xl py-8">
        <h2 className="text-4xl font-bold mb-8">⚙️ Settings</h2>

        {/* Learning Preferences */}
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Learning Preferences
          </h3>

          <div className="space-y-6">
            {/* Difficulty Level */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 bg-white dark:bg-white/[0.06] border border-gray-300 dark:border-white/[0.1] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Interface Language */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Interface Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 bg-white dark:bg-white/[0.06] border border-gray-300 dark:border-white/[0.1] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="english">English</option>
                <option value="simplified">Simplified Chinese</option>
                <option value="traditional">Traditional Chinese</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-lg">
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                Enable Notifications
              </span>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-14 h-8 rounded-full transition ${
                  notifications ? "bg-green-500" : "bg-gray-300 dark:bg-white/[0.15]"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition transform ${
                    notifications ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-lg">
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                Dark Mode
              </span>
              <button
                onClick={toggle}
                className={`relative w-14 h-8 rounded-full transition ${
                  theme === "dark" ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition transform ${
                    theme === "dark" ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Account</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-white/60 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="student@learnchinesese.com"
                className="w-full p-3 bg-white dark:bg-white/[0.06] border border-gray-300 dark:border-white/[0.1] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-white/60 mb-2">
                Username
              </label>
              <input
                type="text"
                defaultValue="learned"
                className="w-full p-3 bg-white dark:bg-white/[0.06] border border-gray-300 dark:border-white/[0.1] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <button className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition">
              Save Changes
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-white/[0.04] border-2 border-red-500 dark:border-red-500/60 rounded-2xl p-6 shadow-sm">
          <h3 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400">Danger Zone</h3>

          <div className="space-y-3">
            <button className="w-full p-3 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition font-semibold">
              Reset All Progress
            </button>
            <button className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
