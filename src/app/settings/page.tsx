"use client";

import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("english");
  const [difficulty, setDifficulty] = useState("intermediate");

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-8">
      <div className="container max-w-2xl">
        <Link
          href="/"
          className="text-white hover:text-gray-200 mb-8 inline-block text-lg"
        >
          ← Back to Home
        </Link>

        <h1 className="text-5xl font-bold text-white mb-8">⚙️ Settings</h1>

        {/* Learning Preferences */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Learning Preferences
          </h2>

          <div className="space-y-6">
            {/* Difficulty Level */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Interface Language */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Interface Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="english">English</option>
                <option value="simplified">Simplified Chinese</option>
                <option value="traditional">Traditional Chinese</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-lg font-semibold text-gray-800">
                Enable Notifications
              </span>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-14 h-8 rounded-full transition ${
                  notifications ? "bg-green-500" : "bg-gray-300"
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
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-lg font-semibold text-gray-800">
                Dark Mode
              </span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-14 h-8 rounded-full transition ${
                  darkMode ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition transform ${
                    darkMode ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Account</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="student@learnchinesese.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Username
              </label>
              <input
                type="text"
                defaultValue="learned"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <button className="w-full btn btn-primary">Save Changes</button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-500">
          <h2 className="text-2xl font-bold mb-6 text-red-600">Danger Zone</h2>

          <div className="space-y-3">
            <button className="w-full p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold">
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
