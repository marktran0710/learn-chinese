import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !["pdf", "docx", "doc", "txt"].includes(ext)) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload PDF, DOCX, or TXT." },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    let text = "";

    if (ext === "pdf") {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = pdfParseModule.default ?? pdfParseModule;
      const data = await (pdfParse as (b: Buffer) => Promise<{ text: string }>)(buffer);
      text = data.text;
    } else if (ext === "docx" || ext === "doc") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = buffer.toString("utf8");
    }

    // Extract Chinese character sequences
    const chineseBlocks = text.match(/[一-鿿㐀-䶿豈-﫿]+/g) ?? [];
    const fullChineseText = chineseBlocks.join("");

    return NextResponse.json({
      text: text.trim(),
      chineseText: fullChineseText,
      charCount: fullChineseText.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
