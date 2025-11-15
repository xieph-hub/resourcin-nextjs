// app/api/apply/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { Buffer } from "buffer";

export const runtime = "nodejs";

// Supabase client (for CV upload)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null;

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let jobId = "";
    let name = "";
    let email = "";
    let phone: string | null = null;
    let location: string | null = null;
    let source = "website";
    let cvFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      // FormData path (with file upload)
      const formData = await req.formData();

      jobId = String(formData.get("jobId") ?? "").trim();
      name = String(formData.get("name") ?? "").trim();
      email = String(formData.get("email") ?? "").trim();
      phone = (formData.get("phone") as string | null) || null;
      location = (formData.get("location") as string | null) || null;
      source =
        (String(formData.get("source") ?? "").trim() as string) || "website";

      const maybeFile = formData.get("resume");
      if (maybeFile instanceof File) {
        cvFile = maybeFile;
      }
    } else if (contentType.includes("application/json")) {
      // JSON path (no file upload, but still supported)
      const body = await req.json();

      jobId = (body.jobId ?? "").trim();
      name = (body.name ?? "").trim();
      email = (body.email ?? "").trim();
      phone = body.phone || null;
      location = body.location || null;
      source = (body.source ?? "website") || "website";
    } else {
      return NextResponse.json(
        { ok: false, message: "Unsupported content type." },
        { status: 400 }
      );
    }

    // Basic validation
    if (!jobId || !name || !email) {
      return NextResponse.json(
        {
          ok: false,
          message: "Missing required fields (jobId, name, email).",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // 1) Ensure job exists and is published
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || !job.isPublished) {
      return NextResponse.json(
        { ok: false, message: "Job not found or not published." },
        { status: 404 }
      );
    }

    // 2) Find or create candidate for this job + email
    let candidate = await prisma.candidate.findFirst({
      where: {
        jobId: job.id,
        email: normalizedEmail,
      },
    });

    let resumeUrl: string | null = null;
    let cvUploadWarning: string | null = null;

    // Helper to upload CV to Supabase
    async function uploadCvFile() {
      if (!cvFile || !supabase) return;

      const fileExt = cvFile.name.split(".").pop() || "pdf";
      const safeName = name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const filePath = `cvs/${job.slug}-${safeName}-${Date.now()}.${fileExt}`;

      const arrayBuffer = await cvFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, buffer, {
          contentType: cvFile.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError || !uploadData?.path) {
        console.error("Supabase upload error:", uploadError);
        cvUploadWarning =
          uploadError?.message ||
          "Supabase storage could not upload the CV file.";
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("resumes").getPublicUrl(uploadData.path);

      resumeUrl = publicUrl;
    }

    if (!candidate) {
      // New candidate
      if (cvFile && supabase) {
        try {
          await uploadCvFile();
        } catch (err) {
          console.error("Unexpected CV upload error (create):", err);
          cvUploadWarning =
            "Unknown storage error while uploading CV. Please try again or email it directly.";
        }
      } else if (cvFile && !supabase) {
        cvUploadWarning =
          "CV file was provided but storage is not configured. Please email it instead.";
      }

      candidate = await prisma.candidate.create({
        data: {
          jobId: job.id,
          fullname: name,
          email: normalizedEmail,
          phone,
          location,
          source,
          resumeUrl,
        },
      });
    } else {
      // Existing candidate — update details and possibly CV
      if (cvFile && supabase) {
        try {
          await uploadCvFile();
        } catch (err) {
          console.error("Unexpected CV upload error (update):", err);
          cvUploadWarning =
            "Unknown storage error while uploading CV. Please try again or email it directly.";
        }
      }

      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          fullname: name || candidate.fullname,
          phone: phone ?? candidate.phone,
          location: location ?? candidate.location,
          source: source || candidate.source,
          ...(resumeUrl ? { resumeUrl } : {}),
        },
      });
    }

    // 3) Create an application row (always)
    await prisma.application.create({
      data: {
        job: { connect: { id: job.id } },
        candidate: { connect: { id: candidate.id } },
        // stage uses default "APPLIED" in schema
      },
    });

    // 4) Final message
    let message = "Thank you — your application has been received.";

    if (cvFile && cvUploadWarning) {
      message = `Your application has been received, but your CV upload failed: ${cvUploadWarning} Please email your CV to hello@resourcin.com with the role title in the subject.`;
    } else if (cvFile && !resumeUrl && !cvUploadWarning) {
      message =
        "Your application has been received, but we could not confirm your CV upload. Please email your CV to hello@resourcin.com with the role title in the subject.";
    }

    return NextResponse.json(
      {
        ok: true,
        message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Apply API error:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We couldn't submit your application due to a server error. Please try again or email us directly.",
      },
      { status: 500 }
    );
  }
}
