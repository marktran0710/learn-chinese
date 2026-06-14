import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { audioFile } = await req.json() as { audioFile: string };
  if (!audioFile || !/^[\w-]+$/.test(audioFile)) {
    return NextResponse.json({ error: "Invalid audioFile" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith("sk-...")) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }

  // Return cached transcript if it exists
  const cacheDir = path.join(process.cwd(), "public", "transcripts", "b1");
  const cachePath = path.join(cacheDir, `${audioFile}.json`);
  if (fs.existsSync(cachePath)) {
    const cached = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    return NextResponse.json(cached);
  }

  const mp3Path = path.join(process.cwd(), "public", "audio", "b1", `${audioFile}.mp3`);
  if (!fs.existsSync(mp3Path)) {
    return NextResponse.json({ error: "Audio file not found" }, { status: 404 });
  }

  // Send to OpenAI Whisper API
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(mp3Path);
  const blob = new Blob([fileBuffer], { type: "audio/mpeg" });
  formData.append("file", blob, `${audioFile}.mp3`);
  formData.append("model", "whisper-1");
  formData.append("language", "zh");
  formData.append("response_format", "verbose_json");
  formData.append("timestamp_granularities[]", "segment");

  const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!resp.ok) {
    const err = await resp.text();
    return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 502 });
  }

  const data = await resp.json() as {
    text: string;
    segments: Array<{ start: number; end: number; text: string }>;
  };

  const result = {
    text: data.text,
    segments: data.segments.map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    })),
  };

  // Cache to disk
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(result, null, 2), "utf8");

  return NextResponse.json(result);
}
