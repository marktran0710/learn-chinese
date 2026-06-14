import { TOCFL_VOCAB } from "@/data/vocabulary";
import { pinyin } from "pinyin-pro";

// Build char → meanings index once
const charIndex = new Map<string, string[]>();
for (const entry of TOCFL_VOCAB) {
  for (const ch of entry.traditional) {
    if (!/[一-鿿]/.test(ch)) continue;
    const list = charIndex.get(ch) ?? [];
    list.push(entry.meaning);
    charIndex.set(ch, list);
  }
}

function shortFirst(meaning: string): string {
  // Pull the shortest token before any comma/semicolon/slash/parenthesis
  return meaning.split(/[,;\/()]/)[0].trim();
}

export function guessMeaning(text: string): string {
  if (!text) return "";

  // 1. Exact TOCFL match
  const exact = TOCFL_VOCAB.find((v) => v.traditional === text);
  if (exact) return exact.meaning;

  // 2. For multi-char text, decompose char by char
  if (text.length > 1) {
    const parts: string[] = [];
    for (const ch of text) {
      const meanings = charIndex.get(ch);
      if (meanings && meanings.length > 0) {
        // Pick the most common (first) and shorten it
        parts.push(shortFirst(meanings[0]));
      }
    }
    if (parts.length > 0) return parts.join(" / ");
  }

  // 3. Single char fallback
  const meanings = charIndex.get(text[0]);
  if (meanings && meanings.length > 0) return shortFirst(meanings[0]);

  return "";
}

export function autoPinyin(text: string): string {
  return pinyin(text, { toneType: "symbol", type: "string" });
}
