"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { PronunciationPlayer } from "@/lib/pronunciation";

interface CustomWord {
  id: string;
  chinese: string;
  pinyin: string;
  meaning: string;
  example?: string;
  createdAt: string;
}

export default function VocabularyPage() {
  const [words, setWords] = useState<CustomWord[]>([]);
  const [formData, setFormData] = useState({
    chinese: "",
    pinyin: "",
    meaning: "",
    example: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Load words from localStorage
  useEffect(() => {
    const savedWords = localStorage.getItem("customWords");
    if (savedWords) {
      try {
        setWords(JSON.parse(savedWords));
      } catch (error) {
        console.error("Error loading words:", error);
      }
    }
    setLoading(false);
  }, []);

  // Save words to localStorage
  const saveToLocalStorage = (updatedWords: CustomWord[]) => {
    localStorage.setItem("customWords", JSON.stringify(updatedWords));
    setWords(updatedWords);
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.chinese || !formData.pinyin || !formData.meaning) {
      alert("Please fill in all required fields");
      return;
    }

    const newWord: CustomWord = {
      id: Date.now().toString(),
      chinese: formData.chinese,
      pinyin: formData.pinyin,
      meaning: formData.meaning,
      example: formData.example,
      createdAt: new Date().toLocaleDateString(),
    };

    const updatedWords = [newWord, ...words];
    saveToLocalStorage(updatedWords);

    // Reset form
    setFormData({ chinese: "", pinyin: "", meaning: "", example: "" });
    setShowForm(false);
  };

  const handleDeleteWord = (id: string) => {
    const updatedWords = words.filter((word) => word.id !== id);
    saveToLocalStorage(updatedWords);
  };

  const handlePlayPronunciation = (wordId: string, chinese: string) => {
    if (playingId === wordId) {
      PronunciationPlayer.stopSpeaking();
      setPlayingId(null);
    } else {
      PronunciationPlayer.speak(chinese, "zh-CN");
      setPlayingId(wordId);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-8">
        <div className="container">
          <p className="text-white">Loading...</p>
        </div>
      </main>
    );
  }

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

        <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
          <h1 className="text-5xl font-bold text-white">📚 My Vocabulary</h1>
          <div className="flex gap-2">
            <Link
              href="/import"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-medium transition text-sm"
            >
              📥 Import File
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary text-lg"
            >
              {showForm ? "✕ Cancel" : "+ Add Word"}
            </button>
          </div>
        </div>

        {/* Add Word Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Add New Word
            </h2>
            <form onSubmit={handleAddWord} className="space-y-4">
              {/* Chinese Character */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Traditional Chinese Character *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 龍 (dragon)"
                  value={formData.chinese}
                  onChange={(e) =>
                    setFormData({ ...formData, chinese: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-xl"
                  maxLength={10}
                />
              </div>

              {/* Pinyin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pinyin (Pronunciation) *
                </label>
                <input
                  type="text"
                  placeholder="e.g., lóng"
                  value={formData.pinyin}
                  onChange={(e) =>
                    setFormData({ ...formData, pinyin: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Meaning */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meaning (English) *
                </label>
                <input
                  type="text"
                  placeholder="e.g., dragon"
                  value={formData.meaning}
                  onChange={(e) =>
                    setFormData({ ...formData, meaning: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Example */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Example Sentence (Optional)
                </label>
                <textarea
                  placeholder="e.g., 中國的龍是很重要的。(Dragons are very important in China.)"
                  value={formData.example}
                  onChange={(e) =>
                    setFormData({ ...formData, example: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 h-24"
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="w-full btn btn-primary text-lg">
                ✓ Save Word
              </button>
            </form>
          </div>
        )}

        {/* Words List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            📖 Your Words ({words.length})
          </h2>

          {words.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-gray-500 text-xl mb-4">No words added yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Add Your First Word
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.map((word) => (
                <div key={word.id} className="card relative">
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteWord(word.id)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xl"
                    title="Delete word"
                  >
                    ✕
                  </button>

                  {/* Character */}
                  <div className="text-5xl font-bold text-gray-800 mb-3">
                    {word.chinese}
                  </div>

                  {/* Pinyin */}
                  <div className="text-lg text-purple-600 font-semibold mb-2">
                    {word.pinyin}
                  </div>

                  {/* Meaning */}
                  <div className="text-lg text-gray-700 mb-3">
                    {word.meaning}
                  </div>

                  {/* Example */}
                  {word.example && (
                    <div className="bg-gray-100 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-600 italic">
                        {word.example}
                      </p>
                    </div>
                  )}

                  {/* Audio Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() =>
                        handlePlayPronunciation(word.id, word.chinese)
                      }
                      className={`py-2 px-3 rounded-lg font-semibold transition ${
                        playingId === word.id
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {playingId === word.id ? "⏹️ Stop" : "🔊 Listen"}
                    </button>
                    <button
                      onClick={() =>
                        handlePlayPronunciation(
                          word.id + "-pinyin",
                          word.pinyin,
                        )
                      }
                      className="py-2 px-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition"
                    >
                      🗣️ Speak
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500">
                    Added: {word.createdAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learning Tips */}
        <div className="mt-12 card bg-blue-50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            💡 Learning Tips
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Add words you encounter in daily life</li>
            <li>✓ Include example sentences for context</li>
            <li>✓ Review your words regularly</li>
            <li>✓ Try to use them in conversations</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
