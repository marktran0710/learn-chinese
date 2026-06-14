import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("v");
  if (!videoId) {
    return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
  }

  try {
    // Try Chinese (Traditional), then Simplified, then auto-generated, then any
    const langs = ["zh-TW", "zh-Hant", "zh", "zh-Hans", "zh-CN"];
    let items = null;

    for (const lang of langs) {
      try {
        items = await YoutubeTranscript.fetchTranscript(videoId, { lang });
        if (items?.length) break;
      } catch {
        // try next lang
      }
    }

    if (!items?.length) {
      // fallback: no lang filter (gets whatever default track exists)
      items = await YoutubeTranscript.fetchTranscript(videoId);
    }

    // Map to our TranscriptLine shape (no pinyin/english — user sees raw Chinese)
    const lines = items.map((item) => ({
      start: item.offset / 1000,
      end: (item.offset + item.duration) / 1000,
      chinese: item.text.replace(/\n/g, " ").trim(),
      pinyin: "",
      english: "",
    }));

    return NextResponse.json({ lines });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
