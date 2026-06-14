import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as OpenCC from "opencc-js";


export async function POST(req: NextRequest) {
  const { audioFile } = await req.json() as { audioFile: string };
  if (!audioFile || !/^[\w-]+$/.test(audioFile)) {
    return NextResponse.json({ error: "Invalid audioFile" }, { status: 400 });
  }

  const cacheDir = path.join(process.cwd(), "public", "transcripts", "b1");
  const cachePath = path.join(cacheDir, `${audioFile}.json`);

  // Return cached transcript if available
  if (fs.existsSync(cachePath)) {
    return NextResponse.json(JSON.parse(fs.readFileSync(cachePath, "utf8")));
  }

  const mp3Path = path.join(process.cwd(), "public", "audio", "b1", `${audioFile}.mp3`);
  if (!fs.existsSync(mp3Path)) {
    return NextResponse.json({ error: "Audio file not found" }, { status: 404 });
  }

  try {
    // Decode MP3 → Float32Array at 16kHz using node-web-audio-api (pure JS/WASM, no ffmpeg)
    const { AudioContext } = await import("node-web-audio-api") as { AudioContext: new (opts?: { sampleRate?: number }) => AudioContext };
    const ctx = new AudioContext({ sampleRate: 16000 });
    const mp3Buffer = fs.readFileSync(mp3Path);
    const audioBuffer = await ctx.decodeAudioData(mp3Buffer.buffer as ArrayBuffer);

    // Mix to mono
    const mono = new Float32Array(audioBuffer.length);
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const chData = audioBuffer.getChannelData(ch);
      for (let i = 0; i < mono.length; i++) mono[i] += chData[i];
    }
    for (let i = 0; i < mono.length; i++) mono[i] /= audioBuffer.numberOfChannels;

    // Run Whisper via @xenova/transformers
    const { pipeline } = await import("@xenova/transformers");
    const transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-small",
      { quantized: true }
    );

    const output = await transcriber(mono, {
      language: "chinese",
      task: "transcribe",
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
    }) as { text: string; chunks?: Array<{ timestamp: [number, number | null]; text: string }> };

    const toTW = OpenCC.Converter({ from: "cn", to: "twp" });

    const segments = (output.chunks ?? []).map((c) => ({
      start: c.timestamp[0],
      end: c.timestamp[1] ?? c.timestamp[0] + 3,
      text: toTW(c.text.trim()),
    })).filter((s) => s.text);

    const result = { text: toTW(output.text.trim()), segments };

    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(result, null, 2), "utf8");

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
