import { NextRequest } from "next/server";
import path from "path";
import os from "os";
import fs from "fs";
import { YoutubeTranscript } from "youtube-transcript";
import youtubeDl from "youtube-dl-exec";
import { pinyin } from "pinyin-pro";

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractId(raw: string): string {
  raw = raw.trim();
  try {
    const url = new URL(raw);
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("?")[0];
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v") ?? raw;
  } catch { /* treat as raw ID */ }
  return raw;
}

function send(ctrl: ReadableStreamDefaultController, data: object) {
  ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

// Free Google Translate — public endpoint, no API key
async function googleTranslate(text: string): Promise<string> {
  if (!text.trim()) return "";
  try {
    const params = new URLSearchParams({ client: "gtx", sl: "zh-TW", tl: "en", dt: "t", q: text });
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`);
    const data = await res.json() as [[string, ...unknown[]][], ...unknown[]];
    return data[0]?.map((x) => x[0]).join("") ?? text;
  } catch {
    return "";
  }
}

// Translate multiple texts with small delay to avoid rate limiting
async function translateBatch(texts: string[]): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < texts.length; i++) {
    results.push(await googleTranslate(texts[i]));
    if (i % 5 === 4) await new Promise((r) => setTimeout(r, 300));
  }
  return results;
}

// Parse VTT subtitle file → timed lines
function parseVtt(content: string): Array<{ start: number; end: number; text: string }> {
  const lines: Array<{ start: number; end: number; text: string }> = [];
  const blocks = content.split(/\n\n+/);

  function toSec(t: string): number {
    const parts = t.trim().split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0];
  }

  for (const block of blocks) {
    const bLines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const timingIdx = bLines.findIndex((l) => l.includes("-->"));
    if (timingIdx === -1) continue;

    const [startRaw, endRaw] = bLines[timingIdx].split("-->").map((s) => s.trim());
    const start = toSec(startRaw.replace(",", "."));
    const end = toSec(endRaw.replace(",", ".").split(" ")[0]);

    const textLines = bLines.slice(timingIdx + 1)
      .map((l) => l.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim())
      .filter(Boolean);

    const text = textLines.join(" ").trim();
    if (text) lines.push({ start, end, text });
  }

  // Deduplicate consecutive identical lines (common in auto-subs)
  const deduped: typeof lines = [];
  for (const line of lines) {
    const last = deduped[deduped.length - 1];
    if (!last || last.text !== line.text) deduped.push(line);
  }
  return deduped;
}

// Chinese stop words to filter from vocab
const STOP = new Set([
  "的", "了", "是", "在", "有", "和", "不", "我", "你", "他", "她", "它",
  "们", "这", "那", "就", "都", "也", "很", "到", "去", "来", "说", "要",
  "会", "能", "把", "被", "从", "让", "用", "看", "出", "对", "好", "没",
  "什么", "怎么", "这个", "那个", "一个", "可以", "因为", "所以", "但是",
  "然后", "一样", "可是", "还是", "已经", "现在", "如果", "虽然", "而且",
  "知道", "自己", "起来", "下来", "一下", "一起", "以为",
]);

function extractVocabWords(chineseLines: string[], count = 8): string[] {
  const freq = new Map<string, number>();
  const text = chineseLines.join("");
  const re = /[一-鿿]{2,4}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const w = m[0];
    if (!STOP.has(w)) freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => w);
}

// Generate questions from vocab (vocabulary matching type)
function makeQuestions(
  vocabList: Array<{ chinese: string; meaning: string }>
): Array<{ question: string; options: string[]; answer: number }> {
  if (vocabList.length < 4) return [];
  const questions = [];
  for (let i = 0; i < Math.min(3, vocabList.length); i++) {
    const correct = vocabList[i];
    const distractors = vocabList
      .filter((_, j) => j !== i)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.meaning);
    const correctIdx = Math.floor(Math.random() * 4);
    const options = [...distractors];
    options.splice(correctIdx, 0, correct.meaning);
    questions.push({
      question: `「${correct.chinese}」的意思是？`,
      options,
      answer: correctIdx,
    });
  }
  return questions;
}

// ── Main route ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { url } = await req.json() as { url: string };
  if (!url) return new Response("Missing url", { status: 400 });

  const videoId = extractId(url);

  const stream = new ReadableStream({
    async start(ctrl) {
      const tmpDir = os.tmpdir();

      try {
        // ── 1. Video info ───────────────────────────────────────────────────
        send(ctrl, { step: "info", message: "Fetching video info…" });

        let title = `Video ${videoId}`;
        let duration = 0;
        let thumbnailUrl = "";

        try {
          const info = await youtubeDl(`https://youtube.com/watch?v=${videoId}`, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            skipDownload: true,
          }) as Record<string, unknown>;
          title = (info.title as string) || title;
          duration = (info.duration as number) || 0;
          const thumbs = (info.thumbnails as Array<{ url: string }>) || [];
          thumbnailUrl = thumbs[thumbs.length - 1]?.url || (info.thumbnail as string) || "";
        } catch (e) {
          send(ctrl, { step: "warn", message: `Could not fetch metadata: ${e instanceof Error ? e.message : e}` });
        }

        send(ctrl, { step: "info_done", title, duration, thumbnailUrl });

        // ── 2. Subtitles: yt-dlp auto-subs (best coverage) ─────────────────
        send(ctrl, { step: "captions", message: "Downloading subtitles with yt-dlp…" });

        let rawLines: Array<{ start: number; end: number; text: string }> = [];
        const vttBase = path.join(tmpDir, `lc_${videoId}`);

        try {
          await youtubeDl(`https://youtube.com/watch?v=${videoId}`, {
            writeAutoSub: true,
            writeSub: true,
            subLang: "zh-TW,zh-Hant,zh,zh-Hans,zh-CN",
            subFormat: "vtt",
            skipDownload: true,
            noWarnings: true,
            noCheckCertificates: true,
            output: `${vttBase}.%(ext)s`,
          } as Record<string, unknown>);

          // Find the downloaded VTT file
          const files = fs.readdirSync(tmpDir).filter(
            (f) => f.startsWith(`lc_${videoId}`) && f.endsWith(".vtt")
          );

          if (files.length > 0) {
            const vttPath = path.join(tmpDir, files[0]);
            const content = fs.readFileSync(vttPath, "utf8");
            rawLines = parseVtt(content);
            fs.unlinkSync(vttPath);
            send(ctrl, { step: "captions_done", lineCount: rawLines.length, source: "yt-dlp" });
          }
        } catch (e) {
          send(ctrl, { step: "warn", message: `yt-dlp subtitle download failed: ${e instanceof Error ? e.message : e}` });
        }

        // ── 3. Fallback: youtube-transcript ────────────────────────────────
        if (!rawLines.length) {
          send(ctrl, { step: "captions", message: "Trying youtube-transcript…" });
          const langs = ["zh-TW", "zh-Hant", "zh", "zh-Hans", "zh-CN"];
          for (const lang of langs) {
            try {
              const items = await YoutubeTranscript.fetchTranscript(videoId, { lang });
              if (items?.length) {
                rawLines = items.map((i) => ({
                  start: i.offset / 1000,
                  end: (i.offset + i.duration) / 1000,
                  text: i.text.replace(/\n/g, " ").trim(),
                }));
                send(ctrl, { step: "captions_done", lineCount: rawLines.length, source: "youtube-transcript" });
                break;
              }
            } catch { /* try next */ }
          }
        }

        // ── 4. Fallback: local Whisper via @xenova/transformers ─────────────
        // Only available when running locally — serverless environments (Vercel etc.)
        // cannot download the 150MB model or sustain long-running CPU work.
        const isServerless = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);

        if (!rawLines.length && !isServerless) {
          send(ctrl, { step: "downloading", message: "No captions found — using local Whisper AI (downloads ~150 MB model on first run)…" });

          try {
            const audioPath = path.join(tmpDir, `lc_audio_${videoId}.mp3`);
            await youtubeDl(`https://youtube.com/watch?v=${videoId}`, {
              output: audioPath,
              extractAudio: true,
              audioFormat: "mp3",
              audioQuality: "32K",
              noCheckCertificates: true,
              noWarnings: true,
            } as Record<string, unknown>);

            send(ctrl, { step: "transcribing", message: "Running Whisper locally (may take several minutes)…" });

            // @xenova/transformers is only available when running locally
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { pipeline } = await import("@xenova/transformers" as any);
            const transcriber = await pipeline(
              "automatic-speech-recognition",
              "Xenova/whisper-small",
              { quantized: true }
            );

            const result = await transcriber(audioPath, {
              language: "chinese",
              task: "transcribe",
              chunk_length_s: 30,
              return_timestamps: true,
            }) as { text: string; chunks?: Array<{ timestamp: [number, number]; text: string }> };

            if (result.chunks?.length) {
              rawLines = result.chunks.map((c) => ({
                start: c.timestamp[0],
                end: c.timestamp[1] ?? c.timestamp[0] + 3,
                text: c.text.trim(),
              }));
            } else if (result.text) {
              rawLines = [{ start: 0, end: duration || 60, text: result.text.trim() }];
            }

            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
            send(ctrl, { step: "transcribing_done", lineCount: rawLines.length });
          } catch (e) {
            send(ctrl, {
              step: "error",
              message: `Local transcription failed: ${e instanceof Error ? e.message : String(e)}`,
            });
            ctrl.close();
            return;
          }
        }

        if (!rawLines.length && isServerless) {
          send(ctrl, {
            step: "error",
            message: "This video has no available Chinese captions. In the cloud version, only videos with YouTube auto-captions are supported. Run the app locally to use the built-in Whisper AI for any video.",
          });
          ctrl.close();
          return;
        }

        if (!rawLines.length) {
          send(ctrl, { step: "error", message: "No transcript found for this video. Please try a video with Chinese captions." });
          ctrl.close();
          return;
        }

        // ── 5. Add pinyin (pinyin-pro, local, no API key) ───────────────────
        send(ctrl, { step: "enhancing", message: "Adding pinyin…" });

        const transcript = rawLines.map((l) => ({
          start: l.start,
          end: l.end,
          chinese: l.text,
          pinyin: pinyin(l.text, { toneType: "symbol", type: "string", nonZh: "consecutive" }),
          english: "",
        }));

        // ── 6. Translate lines (free Google Translate, no API key) ──────────
        send(ctrl, { step: "enhancing", message: "Translating to English (free Google Translate)…" });

        // Translate in one call per line, but only first 50 lines to avoid rate limits
        const toTranslate = transcript.slice(0, 50).map((l) => l.chinese);
        const translations = await translateBatch(toTranslate);
        translations.forEach((t, i) => { transcript[i].english = t; });

        // ── 7. Vocabulary extraction ────────────────────────────────────────
        send(ctrl, { step: "enhancing", message: "Extracting vocabulary…" });

        const chineseText = rawLines.map((l) => l.text);
        const vocabWords = extractVocabWords(chineseText, 8);

        // Translate vocab words
        const vocabTranslations = await translateBatch(vocabWords);
        const vocab = vocabWords.map((w, i) => ({
          chinese: w,
          pinyin: pinyin(w, { toneType: "symbol", type: "string" }),
          meaning: vocabTranslations[i] || w,
        }));

        // ── 8. Generate questions ───────────────────────────────────────────
        const questions = makeQuestions(vocab);

        // Guess level by average line length
        const avgLen = chineseText.reduce((s, l) => s + l.length, 0) / (chineseText.length || 1);
        const level = avgLen < 8 ? "A1" : avgLen < 14 ? "A2" : avgLen < 20 ? "B1" : "B2";

        // ── 9. Build episode ────────────────────────────────────────────────
        const ep = {
          id: `custom-${videoId}-${Date.now()}`,
          youtubeId: videoId,
          title,
          titleZh: title,
          description: "",
          level,
          transcript,
          vocab,
          questions,
          thumbnailUrl,
          duration,
          addedAt: new Date().toISOString(),
        };

        send(ctrl, { step: "done", episode: ep });
      } catch (err) {
        send(ctrl, { step: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        ctrl.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
