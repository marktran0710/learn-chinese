"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { loadCustomWords, saveCustomWords } from "@/lib/storage";
import type { CustomWord } from "@/lib/storage";

// ── Types ─────────────────────────────────────────────────────────────────────

type ExtractedWord = {
  id: string;
  chinese: string;
  pinyin: string;
  meaning: string;
  example: string;
  selected: boolean;
  error?: string;
};

type ParseStatus = "idle" | "parsing" | "done" | "saved";

// ── Parsers ───────────────────────────────────────────────────────────────────

// Detect if a string contains Chinese characters
function hasChinese(s: string) {
  return /[一-鿿㐀-䶿]/.test(s);
}

function rowToWord(row: string[], idx: number): ExtractedWord {
  // Flexible column detection: try to find chinese / pinyin / meaning
  // Supported layouts:
  //   1 col:  Chinese
  //   2 cols: Chinese | Meaning
  //   3 cols: Chinese | Pinyin | Meaning
  //   4 cols: Chinese | Pinyin | Meaning | Example
  //   or any order if first col has Chinese
  const cleaned = row.map((c) => c.trim());
  const chineseCol = cleaned.findIndex(hasChinese);
  const chinese = chineseCol >= 0 ? cleaned[chineseCol] : cleaned[0] ?? "";
  let pinyin = "";
  let meaning = "";
  let example = "";

  if (cleaned.length === 1) {
    // just the character
  } else if (cleaned.length === 2) {
    meaning = cleaned[chineseCol >= 0 ? (chineseCol === 0 ? 1 : 0) : 1] ?? "";
  } else if (cleaned.length === 3) {
    const rest = cleaned.filter((_, i) => i !== chineseCol);
    // pinyin usually has tone marks or numbers
    const pinyinIdx = rest.findIndex((s) => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\d]/.test(s));
    if (pinyinIdx >= 0) {
      pinyin = rest[pinyinIdx];
      meaning = rest[1 - pinyinIdx] ?? "";
    } else {
      pinyin = rest[0] ?? "";
      meaning = rest[1] ?? "";
    }
  } else {
    // 4+ columns: Chinese | Pinyin | Meaning | Example
    const rest = cleaned.filter((_, i) => i !== chineseCol);
    pinyin = rest[0] ?? "";
    meaning = rest[1] ?? "";
    example = rest[2] ?? "";
  }

  return {
    id: `import-${Date.now()}-${idx}`,
    chinese,
    pinyin,
    meaning,
    example,
    selected: chinese.length > 0 && meaning.length > 0,
  };
}

// Parse TXT: each line is one word, delimited by tab / comma / pipe / space+
function parseTxt(text: string): ExtractedWord[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  return lines
    .map((line, i) => {
      // Try multiple delimiters in order
      let cols: string[];
      if (line.includes("\t")) cols = line.split("\t");
      else if (line.includes("|")) cols = line.split("|");
      else if (line.includes(",")) cols = line.split(",");
      else cols = line.split(/\s{2,}/); // 2+ spaces as delimiter
      return rowToWord(cols, i);
    })
    .filter((w) => w.chinese);
}

// Parse CSV
function parseCsv(text: string): ExtractedWord[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  // Detect and skip header row (no Chinese characters)
  const startIdx = lines.length > 0 && !hasChinese(lines[0]) ? 1 : 0;
  return lines
    .slice(startIdx)
    .map((line, i) => {
      // Basic CSV: handle quoted fields
      const cols: string[] = [];
      let cur = "";
      let inQuote = false;
      for (const ch of line) {
        if (ch === '"') { inQuote = !inQuote; continue; }
        if (ch === "," && !inQuote) { cols.push(cur); cur = ""; continue; }
        cur += ch;
      }
      cols.push(cur);
      return rowToWord(cols, i);
    })
    .filter((w) => w.chinese);
}

// Parse Excel/CSV via SheetJS (loaded dynamically)
async function parseExcel(file: File): Promise<ExtractedWord[]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][];
  // Skip header if no Chinese
  const startIdx = rows.length > 0 && !rows[0].some(hasChinese) ? 1 : 0;
  return rows
    .slice(startIdx)
    .map((row, i) => rowToWord(row.map(String), i))
    .filter((w) => w.chinese);
}

// ── Editable row ──────────────────────────────────────────────────────────────
function WordRow({
  word,
  onChange,
  onRemove,
}: {
  word: ExtractedWord;
  onChange: (updated: ExtractedWord) => void;
  onRemove: () => void;
}) {
  function update(field: keyof ExtractedWord, val: string | boolean) {
    onChange({ ...word, [field]: val });
  }

  return (
    <tr className={`border-b transition ${word.selected ? "bg-white" : "bg-gray-50 opacity-60"}`}>
      <td className="px-3 py-2 text-center">
        <input
          type="checkbox"
          checked={word.selected}
          onChange={(e) => update("selected", e.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={word.chinese}
          onChange={(e) => update("chinese", e.target.value)}
          className="w-full text-xl font-bold text-gray-800 border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-transparent"
          placeholder="漢字"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={word.pinyin}
          onChange={(e) => update("pinyin", e.target.value)}
          className="w-full text-sm text-purple-600 border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-transparent"
          placeholder="pīnyīn"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={word.meaning}
          onChange={(e) => update("meaning", e.target.value)}
          className="w-full text-sm text-gray-700 border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-transparent"
          placeholder="meaning"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={word.example}
          onChange={(e) => update("example", e.target.value)}
          className="w-full text-sm text-gray-400 border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-transparent"
          placeholder="example sentence (optional)"
        />
      </td>
      <td className="px-3 py-2 text-center">
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-600 text-lg leading-none"
          title="Remove row"
        >
          ×
        </button>
      </td>
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [words, setWords] = useState<ExtractedWord[]>([]);
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    setError("");
    setStatus("parsing");
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    try {
      let extracted: ExtractedWord[] = [];
      if (ext === "xlsx" || ext === "xls") {
        extracted = await parseExcel(file);
      } else {
        const text = await file.text();
        extracted = ext === "csv" ? parseCsv(text) : parseTxt(text);
      }

      if (extracted.length === 0) {
        setError("No vocabulary found. Make sure each row has a Chinese character and a meaning.");
        setStatus("idle");
        return;
      }
      setWords(extracted);
      setStatus("done");
    } catch (e) {
      setError(`Failed to parse file: ${e instanceof Error ? e.message : String(e)}`);
      setStatus("idle");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function updateWord(idx: number, updated: ExtractedWord) {
    setWords((prev) => prev.map((w, i) => (i === idx ? updated : w)));
  }

  function removeWord(idx: number) {
    setWords((prev) => prev.filter((_, i) => i !== idx));
  }

  function addBlankRow() {
    setWords((prev) => [
      ...prev,
      { id: `manual-${Date.now()}`, chinese: "", pinyin: "", meaning: "", example: "", selected: true },
    ]);
  }

  function toggleAll(checked: boolean) {
    setWords((prev) => prev.map((w) => ({ ...w, selected: checked })));
  }

  function handleConfirm() {
    const toAdd = words.filter((w) => w.selected && w.chinese.trim() && w.meaning.trim());
    const existing = loadCustomWords();
    const existingSet = new Set(existing.map((w) => w.chinese));
    const newWords: CustomWord[] = toAdd
      .filter((w) => !existingSet.has(w.chinese))
      .map((w) => ({
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        chinese: w.chinese.trim(),
        pinyin: w.pinyin.trim(),
        meaning: w.meaning.trim(),
        example: w.example.trim() || undefined,
        createdAt: new Date().toISOString(),
      }));
    saveCustomWords([...existing, ...newWords]);
    setSavedCount(newWords.length);
    setStatus("saved");
  }

  const selectedCount = words.filter((w) => w.selected && w.chinese && w.meaning).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-white hover:text-gray-200 mb-6 inline-block">
          ← Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            📥
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Import Vocabulary</h1>
            <p className="text-white/70">Upload a TXT, CSV, or Excel file to add words to My Words</p>
          </div>
        </div>

        {/* Format Guide */}
        <div className="bg-white/15 backdrop-blur rounded-2xl p-5 mb-6">
          <h2 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">Supported File Formats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white font-bold mb-1">📄 TXT</div>
              <p className="text-white/70 text-xs">One word per line. Separate fields with tab, comma, or 2+ spaces.</p>
              <pre className="text-green-300 text-xs mt-2 font-mono">學校  xuéxiào  school{"\n"}老師  lǎoshī   teacher</pre>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white font-bold mb-1">📊 CSV</div>
              <p className="text-white/70 text-xs">Comma-separated. Optional header row. 2–4 columns.</p>
              <pre className="text-green-300 text-xs mt-2 font-mono">Chinese,Pinyin,Meaning{"\n"}學校,xuéxiào,school</pre>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white font-bold mb-1">📗 Excel (.xlsx)</div>
              <p className="text-white/70 text-xs">First sheet is used. Columns: Chinese | Pinyin | Meaning | Example.</p>
              <pre className="text-green-300 text-xs mt-2 font-mono">Column A → 漢字{"\n"}Column B → pīnyīn{"\n"}Column C → meaning</pre>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        {status !== "saved" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition mb-6 ${
              dragging
                ? "border-white bg-white/20 scale-[1.01]"
                : "border-white/40 bg-white/10 hover:bg-white/15"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.csv,.xlsx,.xls"
              className="hidden"
              onChange={handleInputChange}
            />
            <div className="text-5xl mb-3">{status === "parsing" ? "⏳" : "📂"}</div>
            <p className="text-white font-bold text-lg mb-1">
              {status === "parsing" ? "Parsing file…" : "Drop your file here, or click to browse"}
            </p>
            <p className="text-white/60 text-sm">TXT · CSV · Excel (.xlsx / .xls)</p>
            {fileName && status !== "parsing" && (
              <p className="text-yellow-300 text-sm mt-2 font-medium">📎 {fileName}</p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Saved confirmation */}
        {status === "saved" && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Words Saved!</h2>
            <p className="text-gray-500 mb-6">
              {savedCount} new word{savedCount !== 1 ? "s" : ""} added to My Words.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/vocabulary"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Go to My Words →
              </Link>
              <button
                onClick={() => { setWords([]); setStatus("idle"); setFileName(""); setSavedCount(0); }}
                className="border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Import Another File
              </button>
            </div>
          </div>
        )}

        {/* Review Table */}
        {status === "done" && words.length > 0 && (
          <div>
            {/* Table Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-white font-bold text-lg">
                  {words.length} words extracted
                </span>
                <span className="text-white/60 text-sm ml-3">from {fileName}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addBlankRow}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                >
                  + Add Row
                </button>
                <button
                  onClick={() => { setWords([]); setStatus("idle"); setFileName(""); }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                >
                  ↩ Reupload
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-3 py-3 text-center w-10">
                        <input
                          type="checkbox"
                          checked={words.every((w) => w.selected)}
                          onChange={(e) => toggleAll(e.target.checked)}
                          className="w-4 h-4 accent-blue-600"
                          title="Select all"
                        />
                      </th>
                      <th className="px-3 py-3 text-left font-bold text-gray-700">Chinese 漢字</th>
                      <th className="px-3 py-3 text-left font-bold text-gray-700">Pinyin</th>
                      <th className="px-3 py-3 text-left font-bold text-gray-700">Meaning</th>
                      <th className="px-3 py-3 text-left font-bold text-gray-700">Example (optional)</th>
                      <th className="px-3 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {words.map((word, idx) => (
                      <WordRow
                        key={word.id}
                        word={word}
                        onChange={(updated) => updateWord(idx, updated)}
                        onRemove={() => removeWord(idx)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confirm Bar */}
            <div className="bg-white/15 backdrop-blur rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap sticky bottom-4">
              <p className="text-white text-sm">
                <span className="font-bold text-lg">{selectedCount}</span>
                {" "}word{selectedCount !== 1 ? "s" : ""} selected to import
              </p>
              <button
                onClick={handleConfirm}
                disabled={selectedCount === 0}
                className={`px-8 py-3 rounded-xl font-bold text-base transition ${
                  selectedCount > 0
                    ? "bg-white text-blue-700 hover:bg-blue-50 shadow-lg"
                    : "bg-white/30 text-white/50 cursor-not-allowed"
                }`}
              >
                ✓ Confirm & Save {selectedCount > 0 ? `(${selectedCount})` : ""}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
