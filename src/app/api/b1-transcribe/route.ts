import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { audioFile } = await req.json() as { audioFile: string };
  if (!audioFile || !/^[\w-]+$/.test(audioFile)) {
    return NextResponse.json({ error: "Invalid audioFile" }, { status: 400 });
  }

  const cachePath = path.join(process.cwd(), "public", "transcripts", "b1", `${audioFile}.json`);

  if (fs.existsSync(cachePath)) {
    return NextResponse.json(JSON.parse(fs.readFileSync(cachePath, "utf8")));
  }

  return NextResponse.json(
    { error: "Transcript not available for this audio file." },
    { status: 404 }
  );
}
