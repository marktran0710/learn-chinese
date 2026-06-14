"use client";

import Link from "next/link";
import { useRef, useState, useCallback } from "react";
import { pinyin } from "pinyin-pro";
import { TOCFL_VOCAB, type VocabEntry } from "@/data/vocabulary";
import { loadCustomWords, saveCustomWords } from "@/lib/storage";
import type { CustomWord } from "@/lib/storage";
import { guessMeaning, autoPinyin } from "@/lib/guessMeaning";

// ══════════════════════════════════════════════════════════════════════════════
// Shared helpers
// ══════════════════════════════════════════════════════════════════════════════

function hasChinese(s: string) { return /[一-鿿㐀-䶿]/.test(s); }

function addToMyWords(items: { chinese: string; pinyin: string; meaning: string; example?: string }[]) {
  const existing = loadCustomWords();
  const existingSet = new Set(existing.map((w) => w.chinese));
  const newWords: CustomWord[] = items
    .filter((w) => w.chinese && !existingSet.has(w.chinese))
    .map((w) => ({
      id: `import-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      chinese: w.chinese,
      pinyin: w.pinyin || autoPinyin(w.chinese),
      meaning: w.meaning,
      example: w.example,
      createdAt: new Date().toISOString(),
    }));
  saveCustomWords([...existing, ...newWords]);
  return newWords.length;
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Extract from Document / Text
// ══════════════════════════════════════════════════════════════════════════════

interface UnknownItem { text: string; count: number }
interface SavedMap { [key: string]: boolean }

function matchVocabInText(chineseText: string): VocabEntry[] {
  const found = new Map<string, VocabEntry>();
  const sorted = [...TOCFL_VOCAB].sort((a, b) => b.traditional.length - a.traditional.length);
  for (const entry of sorted) {
    if (chineseText.includes(entry.traditional) && !found.has(entry.traditional)) {
      found.set(entry.traditional, entry);
    }
  }
  return Array.from(found.values()).sort((a, b) => a.traditional.localeCompare(b.traditional));
}

function extractUnknownItems(chineseText: string): UnknownItem[] {
  const knownSet = new Set(TOCFL_VOCAB.map((w) => w.traditional));
  const freq = new Map<string, number>();
  for (let len = 1; len <= 4; len++) {
    for (let i = 0; i <= chineseText.length - len; i++) {
      const gram = chineseText.slice(i, i + len);
      if (!/^[一-鿿㐀-䶿豈-﫿]+$/.test(gram) || knownSet.has(gram)) continue;
      freq.set(gram, (freq.get(gram) ?? 0) + 1);
    }
  }
  const items = Array.from(freq.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count || b.text.length - a.text.length);
  const hidden = new Set<string>();
  for (const item of items) {
    if (item.text.length > 1) {
      for (let i = 0; i <= item.text.length - 1; i++)
        for (let len = 1; len < item.text.length; len++)
          hidden.add(item.text.slice(i, i + len));
    }
  }
  return items.filter((it) => it.text.length > 1 || !hidden.has(it.text)).slice(0, 300);
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-700", A2: "bg-teal-100 text-teal-700",
  B1: "bg-blue-100 text-blue-700",   B2: "bg-purple-100 text-purple-700",
  C1: "bg-orange-100 text-orange-700", C2: "bg-red-100 text-red-700",
};

function LevelBadge({ level }: { level: string }) {
  return <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${LEVEL_COLORS[level] ?? "bg-gray-100 text-gray-600"}`}>{level}</span>;
}

function KnownWordCard({ entry, saved, onSave }: { entry: VocabEntry; saved: boolean; onSave: () => void }) {
  const [showEx, setShowEx] = useState(false);
  const py = pinyin(entry.traditional, { toneType: "symbol", type: "string" });
  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 p-4 transition-all ${saved ? "border-green-400 bg-green-50" : "border-gray-100 hover:border-blue-200"}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-2xl font-bold text-gray-900 leading-none">{entry.traditional}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <LevelBadge level={entry.level} />
          <button onClick={onSave}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition ${saved ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-blue-100 text-gray-500"}`}>
            {saved ? "✓" : "+"}
          </button>
        </div>
      </div>
      <p className="text-blue-500 text-sm font-medium mb-0.5">{py}</p>
      <p className="text-gray-500 text-xs italic mb-1">{entry.partOfSpeech}</p>
      <p className="text-gray-800 text-sm leading-snug">{entry.meaning}</p>
      {entry.example && (
        <button onClick={() => setShowEx((v) => !v)} className="text-xs text-blue-400 hover:text-blue-600 mt-2 underline">
          {showEx ? "Hide example" : "Show example"}
        </button>
      )}
      {showEx && entry.example && (
        <div className="mt-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-gray-800 text-sm">{entry.example}</p>
          <p className="text-gray-500 text-xs mt-0.5 italic">{entry.exampleTranslation}</p>
        </div>
      )}
    </div>
  );
}

function UnknownItemCard({ item, saved, onSave }: { item: UnknownItem; saved: boolean; onSave: () => void }) {
  const py = autoPinyin(item.text);
  const guessed = guessMeaning(item.text);
  return (
    <div className={`bg-white rounded-xl border-2 shadow-sm p-3 flex flex-col items-center gap-1 transition-all ${saved ? "border-green-400 bg-green-50" : "border-gray-100 hover:border-blue-200"}`}>
      <div className={`font-bold text-gray-700 ${item.text.length > 1 ? "text-lg" : "text-2xl"}`}>{item.text}</div>
      <div className="text-blue-400 text-xs text-center">{py}</div>
      {guessed && <div className="text-gray-400 text-xs text-center italic leading-tight">{guessed}</div>}
      {item.count > 1 && <div className="text-gray-300 text-xs">×{item.count}</div>}
      <button onClick={onSave}
        className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${saved ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-blue-100 text-gray-500"}`}>
        {saved ? "✓" : "+"}
      </button>
    </div>
  );
}

type DocResultTab = "known" | "unknown" | "text";
type InputMode = "file" | "type";

function ExtractTab() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [typedText, setTypedText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [rawText, setRawText] = useState("");
  const [chineseText, setChineseText] = useState("");
  const [knownWords, setKnownWords] = useState<VocabEntry[]>([]);
  const [unknownItems, setUnknownItems] = useState<UnknownItem[]>([]);
  const [saved, setSaved] = useState<SavedMap>({});
  const [tab, setTab] = useState<DocResultTab>("known");
  const [filter, setFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  function analyze(text: string, source: string) {
    setError(""); setFileName(source); setKnownWords([]); setUnknownItems([]); setSaved({}); setRawText(text);
    const ct = (text.match(/[一-鿿㐀-䶿豈-﫿]+/g) ?? []).join("");
    setChineseText(ct);
    const known = matchVocabInText(ct);
    setKnownWords(known);
    setUnknownItems(extractUnknownItems(ct));
    setTab("known");
  }

  const processFile = useCallback(async (file: File) => {
    setLoading(true); setError(""); setKnownWords([]); setUnknownItems([]); setSaved({}); setRawText(""); setChineseText("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/extract-doc", { method: "POST", body: fd });
      const data = await res.json() as { text?: string; chineseText?: string; error?: string };
      if (!res.ok || data.error) { setError(data.error ?? "Failed to extract"); return; }
      const ct = data.chineseText ?? "";
      setChineseText(ct); setRawText(data.text ?? ""); setFileName(file.name);
      const known = matchVocabInText(ct);
      setKnownWords(known); setUnknownItems(extractUnknownItems(ct)); setTab("known");
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }, []);

  function saveKnown(entry: VocabEntry) {
    addToMyWords([{ chinese: entry.traditional, pinyin: entry.pinyin, meaning: entry.meaning }]);
    setSaved((s) => ({ ...s, [entry.traditional]: true }));
  }

  function saveUnknown(item: UnknownItem) {
    const meaning = guessMeaning(item.text);
    addToMyWords([{ chinese: item.text, pinyin: autoPinyin(item.text), meaning }]);
    setSaved((s) => ({ ...s, [`u:${item.text}`]: true }));
  }

  const filteredWords = knownWords.filter((w) => {
    const q = filter.toLowerCase();
    return (!q || w.traditional.includes(q) || w.pinyin.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q))
      && (levelFilter === "all" || w.level === levelFilter);
  });
  const levels = Array.from(new Set(knownWords.map((w) => w.level))).sort();
  const hasResults = chineseText.length > 0;
  const savedCount = Object.keys(saved).length;

  return (
    <div>
      {/* Input mode toggle */}
      <div className="flex gap-2 mb-4">
        {([["file", "📁 Upload File"], ["type", "⌨️ Type / Paste"]] as [InputMode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => setInputMode(m)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${inputMode === m ? "bg-yellow-400 text-gray-900" : "bg-white/15 text-white hover:bg-white/25"}`}>
            {label}
          </button>
        ))}
      </div>

      {inputMode === "file" && (
        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition mb-6 ${dragging ? "border-yellow-400 bg-yellow-400/10" : "border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10"}`}>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          <div className="text-5xl mb-3">{loading ? "⏳" : "📁"}</div>
          {loading ? <p className="text-white font-bold">Extracting vocabulary…</p>
            : fileName && hasResults ? <div><p className="text-yellow-300 font-bold">{fileName}</p><p className="text-white/50 text-sm mt-1">Click to replace</p></div>
            : <div><p className="text-white font-bold text-lg mb-1">Drop your document here</p><p className="text-white/50 text-sm">PDF · DOCX · DOC · TXT</p></div>}
        </div>
      )}

      {inputMode === "type" && (
        <div className="mb-6 space-y-3">
          <textarea value={typedText} onChange={(e) => setTypedText(e.target.value)} rows={8}
            placeholder={"在這裡輸入或貼上中文文字…\nType or paste Chinese text here."}
            className="w-full bg-white/10 text-white placeholder:text-white/35 rounded-2xl px-5 py-4 text-base border-2 border-white/20 focus:outline-none focus:border-yellow-400 transition resize-none leading-relaxed" />
          <div className="flex gap-3 items-center">
            <button onClick={() => typedText.trim() && analyze(typedText, "typed text")} disabled={!typedText.trim()}
              className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl text-sm transition disabled:opacity-40">
              🔍 Analyse Text
            </button>
            <button onClick={() => { setTypedText(""); setChineseText(""); setKnownWords([]); setUnknownItems([]); setSaved({}); setRawText(""); setFileName(""); }}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm transition">Clear</button>
            {typedText.length > 0 && <span className="text-white/40 text-xs ml-auto">{(typedText.match(/[一-鿿㐀-䶿豈-﫿]+/g) ?? []).join("").length} Chinese chars</span>}
          </div>
        </div>
      )}

      {error && <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-4 mb-6 text-red-200"><strong>Error:</strong> {error}</div>}

      {hasResults && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              ["Chinese chars", chineseText.length, "bg-white/10 text-white"],
              ["TOCFL words", knownWords.length, "bg-blue-500/30 text-white"],
              ["Unknown items", unknownItems.length, "bg-orange-500/30 text-white"],
              ["Saved", savedCount, "bg-green-500/30 text-white"],
            ].map(([label, val, cls]) => (
              <div key={label as string} className={`rounded-xl px-4 py-3 text-center ${cls}`}>
                <div className="text-2xl font-black">{val}</div>
                <div className="text-xs opacity-70 font-medium">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            {([
              ["known", `📚 TOCFL Words (${knownWords.length})`],
              ["unknown", `❓ Unknown (${unknownItems.length})`],
              ["text", "📝 Raw Text"],
            ] as [DocResultTab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t ? "bg-yellow-400 text-gray-900" : "bg-white/15 text-white hover:bg-white/25"}`}>
                {label}
              </button>
            ))}
          </div>

          {tab === "known" && (
            <div>
              <div className="flex flex-wrap gap-3 mb-3 items-center">
                <input type="text" placeholder="Search…" value={filter} onChange={(e) => setFilter(e.target.value)}
                  className="flex-1 min-w-40 bg-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-2 text-sm border border-white/20 focus:outline-none focus:border-yellow-400" />
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
                  className="bg-white/10 text-white rounded-xl px-3 py-2 text-sm border border-white/20 focus:outline-none">
                  <option value="all" className="text-gray-900">All Levels</option>
                  {levels.map((l) => <option key={l} value={l} className="text-gray-900">{l}</option>)}
                </select>
                <button onClick={() => filteredWords.forEach((e) => { if (!saved[e.traditional]) saveKnown(e); })}
                  className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-sm transition">
                  Save All ({filteredWords.length})
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {levels.map((l) => (
                  <button key={l} onClick={() => setLevelFilter(levelFilter === l ? "all" : l)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${levelFilter === l ? "ring-2 ring-yellow-400" : ""} ${LEVEL_COLORS[l] ?? "bg-gray-100 text-gray-600"}`}>
                    {l} · {knownWords.filter((w) => w.level === l).length}
                  </button>
                ))}
              </div>
              {filteredWords.length === 0
                ? <p className="text-white/40 text-center py-10">No words match.</p>
                : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredWords.map((e) => <KnownWordCard key={e.id} entry={e} saved={!!saved[e.traditional]} onSave={() => saveKnown(e)} />)}
                </div>}
            </div>
          )}

          {tab === "unknown" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-sm">Meanings are auto-guessed — edit in <Link href="/vocabulary" className="underline text-yellow-300">My Words</Link>.</p>
                <button onClick={() => unknownItems.forEach((it) => { if (!saved[`u:${it.text}`]) saveUnknown(it); })}
                  className="shrink-0 ml-4 px-4 py-1.5 bg-green-500 hover:bg-green-400 text-white text-xs font-bold rounded-xl transition">
                  Save All
                </button>
              </div>
              {unknownItems.length === 0
                ? <p className="text-white/40 text-center py-10">All items matched to TOCFL vocab!</p>
                : <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {unknownItems.map((it) => <UnknownItemCard key={it.text} item={it} saved={!!saved[`u:${it.text}`]} onSave={() => saveUnknown(it)} />)}
                </div>}
            </div>
          )}

          {tab === "text" && (
            <div className="bg-white/10 rounded-2xl p-5">
              <p className="text-white/50 text-xs mb-3 font-bold uppercase tracking-wide">Extracted Text — {rawText.length} chars</p>
              <pre className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed font-sans max-h-96 overflow-y-auto">{rawText || "(No text)"}</pre>
            </div>
          )}
        </>
      )}

      {!hasResults && !loading && !error && (
        <div className="bg-white/10 rounded-2xl p-10 text-center">
          <div className="text-6xl mb-4">🈶</div>
          <h3 className="text-white font-bold text-xl mb-5">How it works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              ["1️⃣ Input", "Upload PDF / DOCX / TXT or paste any Chinese text"],
              ["2️⃣ Extract", "Every word is matched against TOCFL; unknown items get auto-guessed meanings"],
              ["3️⃣ Study", "Save to My Words and practice with flashcards or quizzes"],
            ].map(([title, desc]) => (
              <div key={title as string} className="bg-white/10 rounded-xl p-4">
                <div className="text-lg font-bold text-white mb-1">{title}</div>
                <div className="text-white/60 text-sm">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Word List Import (TXT / CSV / Excel)
// ══════════════════════════════════════════════════════════════════════════════

type ExtractedWord = {
  id: string; chinese: string; pinyin: string; meaning: string; example: string; selected: boolean;
};
type ParseStatus = "idle" | "parsing" | "done" | "saved";

function rowToWord(row: string[], idx: number): ExtractedWord {
  const cleaned = row.map((c) => c.trim());
  const chineseCol = cleaned.findIndex(hasChinese);
  const chinese = chineseCol >= 0 ? cleaned[chineseCol] : cleaned[0] ?? "";
  let py = "", meaning = "", example = "";
  if (cleaned.length === 2) {
    meaning = cleaned[chineseCol === 0 ? 1 : 0] ?? "";
  } else if (cleaned.length === 3) {
    const rest = cleaned.filter((_, i) => i !== chineseCol);
    const pIdx = rest.findIndex((s) => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\d]/.test(s));
    if (pIdx >= 0) { py = rest[pIdx]; meaning = rest[1 - pIdx] ?? ""; }
    else { py = rest[0] ?? ""; meaning = rest[1] ?? ""; }
  } else if (cleaned.length >= 4) {
    const rest = cleaned.filter((_, i) => i !== chineseCol);
    py = rest[0] ?? ""; meaning = rest[1] ?? ""; example = rest[2] ?? "";
  }
  // Auto-fill pinyin and meaning if missing
  if (!py && chinese) py = autoPinyin(chinese);
  if (!meaning && chinese) meaning = guessMeaning(chinese);
  return { id: `import-${Date.now()}-${idx}`, chinese, pinyin: py, meaning, example, selected: chinese.length > 0 };
}

function parseTxt(text: string): ExtractedWord[] {
  return text.split(/\r?\n/).filter((l) => l.trim()).map((line, i) => {
    let cols: string[];
    if (line.includes("\t")) cols = line.split("\t");
    else if (line.includes("|")) cols = line.split("|");
    else if (line.includes(",")) cols = line.split(",");
    else cols = line.split(/\s{2,}/);
    return rowToWord(cols, i);
  }).filter((w) => w.chinese);
}

function parseCsv(text: string): ExtractedWord[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const start = lines.length > 0 && !hasChinese(lines[0]) ? 1 : 0;
  return lines.slice(start).map((line, i) => {
    const cols: string[] = []; let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { cols.push(cur); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur);
    return rowToWord(cols, i);
  }).filter((w) => w.chinese);
}

async function parseExcel(file: File): Promise<ExtractedWord[]> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][];
  const start = rows.length > 0 && !rows[0].some(hasChinese) ? 1 : 0;
  return rows.slice(start).map((row, i) => rowToWord(row.map(String), i)).filter((w) => w.chinese);
}

function WordRow({ word, onChange, onRemove }: { word: ExtractedWord; onChange: (u: ExtractedWord) => void; onRemove: () => void }) {
  function upd(field: keyof ExtractedWord, val: string | boolean) { onChange({ ...word, [field]: val }); }
  return (
    <tr className={`border-b transition ${word.selected ? "bg-white" : "bg-gray-50 opacity-60"}`}>
      <td className="px-3 py-2 text-center"><input type="checkbox" checked={word.selected} onChange={(e) => upd("selected", e.target.checked)} className="w-4 h-4 accent-blue-600" /></td>
      <td className="px-3 py-2"><input value={word.chinese} onChange={(e) => upd("chinese", e.target.value)} className="w-full text-xl font-bold text-gray-800 border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-transparent" placeholder="漢字" /></td>
      <td className="px-3 py-2"><input value={word.pinyin} onChange={(e) => upd("pinyin", e.target.value)} className="w-full text-sm text-purple-600 border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-transparent" placeholder="pīnyīn" /></td>
      <td className="px-3 py-2"><input value={word.meaning} onChange={(e) => upd("meaning", e.target.value)} className="w-full text-sm text-gray-700 border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-transparent" placeholder="meaning" /></td>
      <td className="px-3 py-2"><input value={word.example} onChange={(e) => upd("example", e.target.value)} className="w-full text-sm text-gray-400 border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-transparent" placeholder="example (optional)" /></td>
      <td className="px-3 py-2 text-center"><button onClick={onRemove} className="text-red-400 hover:text-red-600 text-lg">×</button></td>
    </tr>
  );
}

function WordListTab() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [words, setWords] = useState<ExtractedWord[]>([]);
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    setError(""); setStatus("parsing"); setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    try {
      let extracted: ExtractedWord[] = [];
      if (ext === "xlsx" || ext === "xls") extracted = await parseExcel(file);
      else { const text = await file.text(); extracted = ext === "csv" ? parseCsv(text) : parseTxt(text); }
      if (extracted.length === 0) { setError("No vocabulary found."); setStatus("idle"); return; }
      setWords(extracted); setStatus("done");
    } catch (e) { setError(`Parse error: ${e instanceof Error ? e.message : String(e)}`); setStatus("idle"); }
  }

  function handleConfirm() {
    const toAdd = words.filter((w) => w.selected && w.chinese.trim());
    const n = addToMyWords(toAdd.map((w) => ({ chinese: w.chinese.trim(), pinyin: w.pinyin.trim(), meaning: w.meaning.trim(), example: w.example.trim() || undefined })));
    setSavedCount(n); setStatus("saved");
  }

  const selectedCount = words.filter((w) => w.selected && w.chinese).length;

  return (
    <div>
      <div className="bg-white/10 rounded-2xl p-4 mb-5">
        <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-3">Supported formats</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {[
            ["📄 TXT", "One word per line. Tab / comma / 2+ spaces as delimiter.", "學校  xuéxiào  school"],
            ["📊 CSV", "Comma-separated. Optional header. 2–4 columns.", "學校,xuéxiào,school"],
            ["📗 Excel", "First sheet. Columns: Chinese | Pinyin | Meaning | Example.", "Column A → 漢字"],
          ].map(([title, desc, ex]) => (
            <div key={title as string} className="bg-white/10 rounded-xl p-3">
              <div className="text-white font-bold mb-1">{title}</div>
              <p className="text-white/60 text-xs mb-1">{desc}</p>
              <pre className="text-green-300 text-xs font-mono">{ex}</pre>
            </div>
          ))}
        </div>
      </div>

      {status !== "saved" && (
        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition mb-5 ${dragging ? "border-yellow-400 bg-yellow-400/10" : "border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10"}`}>
          <input ref={fileRef} type="file" accept=".txt,.csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          <div className="text-5xl mb-3">{status === "parsing" ? "⏳" : "📂"}</div>
          <p className="text-white font-bold text-lg mb-1">{status === "parsing" ? "Parsing…" : "Drop file or click to browse"}</p>
          <p className="text-white/50 text-sm">TXT · CSV · Excel</p>
          {fileName && status !== "parsing" && <p className="text-yellow-300 text-sm mt-2">📎 {fileName}</p>}
        </div>
      )}

      {error && <div className="bg-red-500/20 border border-red-400/40 text-red-200 rounded-xl p-4 mb-5">{error}</div>}

      {status === "saved" && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl mb-5">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Saved!</h2>
          <p className="text-gray-500 mb-6">{savedCount} new word{savedCount !== 1 ? "s" : ""} added to My Words.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/vocabulary" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Go to My Words →</Link>
            <button onClick={() => { setWords([]); setStatus("idle"); setFileName(""); setSavedCount(0); }}
              className="border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition">Import Another</button>
          </div>
        </div>
      )}

      {status === "done" && words.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <span className="text-white font-bold">{words.length} words found <span className="text-white/50 text-sm font-normal">from {fileName}</span></span>
            <div className="flex gap-2">
              <button onClick={() => setWords((p) => [...p, { id: `manual-${Date.now()}`, chinese: "", pinyin: "", meaning: "", example: "", selected: true }])}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition">+ Add Row</button>
              <button onClick={() => { setWords([]); setStatus("idle"); setFileName(""); }}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition">↩ Re-upload</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-3 py-3 text-center w-10">
                      <input type="checkbox" checked={words.every((w) => w.selected)} onChange={(e) => setWords((p) => p.map((w) => ({ ...w, selected: e.target.checked })))} className="w-4 h-4 accent-blue-600" />
                    </th>
                    <th className="px-3 py-3 text-left font-bold text-gray-700">Chinese</th>
                    <th className="px-3 py-3 text-left font-bold text-gray-700">Pinyin</th>
                    <th className="px-3 py-3 text-left font-bold text-gray-700">Meaning</th>
                    <th className="px-3 py-3 text-left font-bold text-gray-700">Example</th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((word, idx) => (
                    <WordRow key={word.id} word={word}
                      onChange={(u) => setWords((p) => p.map((w, i) => i === idx ? u : w))}
                      onRemove={() => setWords((p) => p.filter((_, i) => i !== idx))} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap sticky bottom-4">
            <p className="text-white text-sm"><span className="font-bold text-lg">{selectedCount}</span> word{selectedCount !== 1 ? "s" : ""} selected</p>
            <button onClick={handleConfirm} disabled={selectedCount === 0}
              className={`px-8 py-3 rounded-xl font-bold text-base transition ${selectedCount > 0 ? "bg-white text-blue-700 hover:bg-blue-50 shadow-lg" : "bg-white/30 text-white/50 cursor-not-allowed"}`}>
              ✓ Save {selectedCount > 0 ? `(${selectedCount})` : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════════════════

type MainTab = "extract" | "wordlist";

export default function ImportPage() {
  const [mainTab, setMainTab] = useState<MainTab>("extract");
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-800 to-indigo-800 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-white/70 hover:text-white text-sm mb-6 inline-block">← Back to Home</Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">📥</div>
          <div>
            <h1 className="text-3xl font-bold text-white">Vocabulary Import</h1>
            <p className="text-white/60">Extract words from any document, or import a structured word list</p>
          </div>
        </div>

        {/* Main tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/20 pb-4">
          {([
            ["extract", "📄 Extract from Document"],
            ["wordlist", "📋 Import Word List"],
          ] as [MainTab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setMainTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${mainTab === t ? "bg-white text-blue-800" : "bg-white/10 text-white hover:bg-white/20"}`}>
              {label}
            </button>
          ))}
        </div>

        {mainTab === "extract" && <ExtractTab />}
        {mainTab === "wordlist" && <WordListTab />}
      </div>
    </main>
  );
}
