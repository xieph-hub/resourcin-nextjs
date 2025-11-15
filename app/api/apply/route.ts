// app/api/apply/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendCandidateApplicationReceivedEmail,
  sendAdminNewApplicationEmail,
} from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const jobSlug = body?.jobSlug as string | undefined;
    const jobTitleFromClient = body?.jobTitle as string | undefined;
    const rawName = body?.name as string | undefined;
    const rawEmail = body?.email as string | undefined;
    const phone = (body?.phone as string | undefined) || null;
    const location = (body?.location as string | undefined) || null;
    const resumeUrl = (body?.resumeUrl as string | undefined) || null;
    const source = (body?.source as string | undefined) || "website";

    const name = rawName?.trim() || "";
    const email = rawEmail?.trim().toLowerCase() || "";

    if (!jobSlug || !name || !email) {
      return NextResponse.json(
        {
          ok: false,
          message: "Missing required fields (jobSlug, name, email).",
        },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { slug: jobSlug },
    });

    if (!job) {
      return NextResponse.json(
        {
          ok: false,
          message: "Job not found.",
        },
        { status: 404 }
      );
    }

    // Find or create candidate based on email
    let candidate = await prisma.candidate.findFirst({
      where: {
        email,
      },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          job: { connect: { id: job.id } },
          fullname: name,
          email,
          phone,
          location,
          resumeUrl,
          source,
        },
      });
    } else {
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          job: { connect: { id: job.id } },
          fullname: candidate.fullname || name,
          phone: phone || candidate.phone,
          location: location || candidate.location,
          resumeUrl: resumeUrl || candidate.resumeUrl,
          source: source || candidate.source,
        },
      });
    }

    const application = await prisma.application.create({
      data: {
        job: { connect: { id: job.id } },
        candidate: { connect: { id: candidate.id } },
        stage: "APPLIED",
        source,
      },
      include: {
        job: true,
        candidate: true,
      },
    });

    // Fire-and-forget style (we still await here so we can log errors,
    // but errors won't break the application response)
    try {
      await Promise.all([
        sendCandidateApplicationReceivedEmail({
          to: application.candidate.email,
          candidateName: application.candidate.fullname,
          jobTitle:
            application.job.title || jobTitleFromClient || "your application",
        }),
        sendAdminNewApplicationEmail({
          candidateName: application.candidate.fullname,
          candidateEmail: application.candidate.email,
          candidatePhone: application.candidate.phone || null,
          candidateLocation: application.candidate.location || null,
          jobTitle:
            application.job.title || jobTitleFromClient || "Unknown role",
          jobSlug,
          source,
        }),
      ]);
    } catch (err) {
      console.error("Error sending application emails:", err);
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Application received.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Apply API error:", error);
    const msg =
      error?.message ||
      "Something went wrong while submitting your application.";

    return NextResponse.json(
      {
        ok: false,
        message: msg,
      },
      { status: 500 }
    );
  }
}
