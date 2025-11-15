// app/api/application-notes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const applicationId = body?.applicationId as string | undefined;
    const noteBody = body?.body as string | undefined;
    const authorRaw = body?.author as string | undefined;

    if (!applicationId || !noteBody || !noteBody.trim()) {
      return NextResponse.json(
        {
          ok: false,
          message: "applicationId and body are required.",
        },
        { status: 400 }
      );
    }

    const author =
      (authorRaw && authorRaw.trim()) || "Recruiter";

    const note = await prisma.note.create({
      data: {
        applicationId,
        body: noteBody.trim(),
        author,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        note,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create note error:", error);

    const msg =
      error?.message || "Something went wrong while saving the note.";

    return NextResponse.json(
      {
        ok: false,
        message: msg,
      },
      { status: 500 }
    );
  }
}
