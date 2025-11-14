// app/api/apply/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { supabaseServer } from "@/lib/storage";

export const runtime = "nodejs"; // ensure Node runtime

// TODO: swap this stub with a real PDF/DOCX parser later
async function extractText(_buf: Buffer): Promise<string> {
  return "";
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    if (!jobId) {
      return NextResponse.json({ ok: false, message: "Missing jobId" }, { status: 400 });
    }

    // Ensure job exists & is published
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || !job.isPublished) {
      return NextResponse.json({ ok: false, message: "Job not found or unpublished" }, { status: 404 });
    }

    const form = await req.formData();
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const phone = String(form.get("phone") || "");
    const file = form.get("resume") as File | null;

    if (!name || !email || !file) {
      return NextResponse.json({ ok: false, message: "Missing required fields" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const objectPath = `${jobId}/${Date.now()}-${safeName}`;

    // Upload to **private** bucket (resumes)
    const { error: upErr } = await supabaseServer.storage
      .from("resumes")
      .upload(objectPath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) throw upErr;

    // Parse text (placeholder)
    const rawText = await extractText(bytes);

    // Create candidate + application
    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        phone,
        // store the PRIVATE path only (no public URL)
        resumeUrl: objectPath,
        rawText,
      },
    });

    await prisma.application.create({
      data: {
        jobId,
        candidateId: candidate.id,
        source: "inbound",
      },
    });

    // Redirect to a clean success page
    const success = new URL(`/apply/success?title=${encodeURIComponent(job.title)}`, url.origin);
    return NextResponse.redirect(success, 302);
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message ?? "Error" }, { status: 500 });
  }
}
