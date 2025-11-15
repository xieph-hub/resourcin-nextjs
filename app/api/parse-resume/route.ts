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
          message:
            "Please paste the full CV or profile text (at least a few lines).",
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
        model: "gpt-4.1-mini", // if model issues appear, try "gpt-4o-mini" instead
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `CV OR PROFILE TEXT:\n\n${text}` },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      // Try to pull a useful error message from OpenAI
      let details = "";
      try {
        const errJson = await response.json();
        details = errJson?.error?.message || JSON.stringify(errJson);
      } catch {
        try {
          details = await response.text();
        } catch {
          details = "";
        }
      }

      console.error(
        "OpenAI API error:",
        response.status,
        response.statusText,
        details
      );

      let userMessage = "AI service returned an error while parsing the profile.";

      if (response.status === 401) {
        userMessage =
          "AI key is invalid or not authorized. Check your OPENAI_API_KEY.";
      } else if (response.status === 404) {
        userMessage =
          'AI model not found for this key. Try changing the model name (e.g. to "gpt-4o-mini").';
      } else if (response.status === 429) {
        userMessage =
          "AI rate limit or quota exceeded on your OpenAI account.";
      } else if (response.status === 400) {
        userMessage =
          "AI request was rejected (bad request). Check model and parameters.";
      }

      return NextResponse.json(
        {
          ok: false,
          message: `${userMessage} (status ${response.status}${
            details ? `: ${details}` : ""
          })`,
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
      parsed = JSON.parse(content);
    } catch {
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) {
        console.error("Could not find JSON in AI response:", content);
        return NextResponse.json(
          {
            ok: false,
            message:
              "AI returned an unexpected format. Please try again or fill fields manually.",
          },
          { status: 500 }
        );
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
