import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ParsedCandidate = {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  source?: string;
  skills?: string;
  summary?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body?.text as string | undefined) || "";

    if (!text || text.trim().length < 30) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please paste the full CV or profile text (at least a few lines).",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "AI parsing is not configured. Please set OPENAI_API_KEY in your environment.",
        },
        { status: 500 }
      );
    }

    const prompt = `
You are a recruitment assistant. Extract structured candidate data from the CV or LinkedIn profile text below.

Return ONLY a valid JSON object, no code fences, no extra text. Use this exact shape:

{
  "fullName": "Candidate full name if clearly present, else empty string",
  "email": "Best guess email if present, else empty string",
  "phone": "Best guess phone number if present, else empty string",
  "location": "Best guess location (city, country) if present, else empty string",
  "source": "LinkedIn" | "CV" | "Other",
  "skills": "comma-separated list of key hard skills, e.g. \"Product Management, Fintech, SQL\"",
  "summary": "short 2-3 sentence summary of the candidate's profile"
}

If something is unknown, use an empty string for that field.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini", // you can change to another model if you want
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `CV OR PROFILE TEXT:\n\n${text}` },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("OpenAI error:", response.status, errText);
      return NextResponse.json(
        {
          ok: false,
          message: "AI service returned an error while parsing the profile.",
        },
        { status: 500 }
      );
    }

    const json = await response.json();
    const content: string | undefined =
      json?.choices?.[0]?.message?.content || "";

    if (!content) {
      return NextResponse.json(
        {
          ok: false,
          message: "AI did not return any content.",
        },
        { status: 500 }
      );
    }

    let parsed: ParsedCandidate;

    try {
      // Ideally the model returns pure JSON
      parsed = JSON.parse(content);
    } catch {
      // Fallback: try to extract JSON substring between first { and last }
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) {
        throw new Error("Could not find JSON object in AI response.");
      }
      const jsonSubstring = content.slice(start, end + 1);
      parsed = JSON.parse(jsonSubstring);
    }

    return NextResponse.json({ ok: true, data: parsed });
  } catch (error) {
    console.error("[/api/parse-resume] error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to parse the resume/profile text.",
      },
      { status: 500 }
    );
  }
}
