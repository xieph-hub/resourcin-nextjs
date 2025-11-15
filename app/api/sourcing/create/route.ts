import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = (body?.fullName as string | undefined)?.trim();
    const email = (body?.email as string | undefined)?.toLowerCase().trim();
    const phone = (body?.phone as string | undefined)?.trim() || null;
    const location = (body?.location as string | undefined)?.trim() || null;
    const resumeUrl = (body?.resumeUrl as string | undefined)?.trim() || null;
    const source =
      (body?.source as string | undefined)?.trim() || "Sourced (manual)";
    const rawText = (body?.rawText as string | undefined)?.trim() || null;

    if (!fullName || !email) {
      return NextResponse.json(
        {
          ok: false,
          message: "Full name and email are required.",
        },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.create({
      data: {
        fullname: fullName,
        email,
        phone,
        location,
        resumeUrl,
        source,
        rawText,
        // jobId is optional; for general sourcing we leave it null
      },
    });

    return NextResponse.json({
      ok: true,
      candidate: {
        id: candidate.id,
        fullname: candidate.fullname,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        source: candidate.source,
        createdAt: candidate.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[/api/sourcing/create] error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to save candidate.",
      },
      { status: 500 }
    );
  }
}
