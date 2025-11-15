// app/api/apply/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let jobId: string | undefined;
    let name: string | undefined;
    let email: string | undefined;
    let phone: string | undefined;
    let location: string | undefined;
    let source: string | undefined;
    let cvFile: File | null = null;

    // 1️⃣ Parse body – multipart (with file) OR JSON
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      jobId = formData.get("jobId")?.toString();
      name = formData.get("name")?.toString();
      email = formData.get("email")?.toString();
      phone = formData.get("phone")?.toString() || undefined;
      location = formData.get("location")?.toString() || undefined;
      source = (formData.get("source")?.toString() || "website") as string;

      const cv = formData.get("cv");
      if (cv instanceof File && cv.size > 0) {
        cvFile = cv;
      }
    } else {
      const body = await req.json().catch(() => null);

      jobId = body?.jobId;
      name = body?.name;
      email = body?.email;
      phone = body?.phone;
      location = body?.location;
      source = body?.source || "website";
    }

    // 2️⃣ Basic validation
    if (!jobId || !name || !email) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields (jobId, name, email)." },
        { status: 400 }
      );
    }

    // 3️⃣ Find job strictly by ID
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { ok: false, message: "Job could not be found." },
        { status: 404 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 4️⃣ Find or create Candidate by email
    let candidate = await prisma.candidate.findFirst({
      where: { email: normalizedEmail },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          fullname: name,
          email: normalizedEmail,
          phone: phone || null,
          location: location || null,
          source: source || "website",
        },
      });
    } else {
      // light update with freshest details
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          fullname: candidate.fullname || name,
          phone: phone || candidate.phone,
          location: location || candidate.location,
          source: candidate.source || source,
        },
      });
    }

    // 5️⃣ Try upload CV to Supabase (non-blocking)
    let resumeUrl: string | null = null;
    let cvWarning: string | null = null;

    if (cvFile) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        cvWarning = "Supabase environment variables are not configured.";
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const ext = cvFile.name.split(".").pop() || "pdf";
        const objectPath = `cv/${candidate.id}-${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resourcin-uploads") // 🔒 make sure this matches your bucket name
          .upload(objectPath, cvFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: cvFile.type || "application/octet-stream",
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          cvWarning = uploadError.message || "Upload failed.";
        } else if (uploadData) {
          resumeUrl = `${supabaseUrl}/storage/v1/object/public/resourcin-uploads/${objectPath}`;
        }
      }
    }

    // If we got a URL, store it on Candidate
    if (resumeUrl) {
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { resumeUrl },
      });
    }

    // 6️⃣ Create Application – keep it lean to match your schema
    const application = await prisma.application.create({
      data: {
        job: { connect: { id: job.id } },
        candidate: { connect: { id: candidate.id } },
        stage: "APPLIED",
      },
    });

    let message =
      "Thank you — your application has been received. We’ll be in touch if there’s a fit.";

    if (cvWarning && !resumeUrl) {
      message =
        `Your application has been received, but your CV upload failed: ${cvWarning}. ` +
        `Please email your CV to hello@resourcin.com with the role title in the subject.`;
    }

    return NextResponse.json(
      {
        ok: true,
        message,
        applicationId: application.id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Apply API error:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Something went wrong while submitting your application. Please try again or email us directly.",
      },
      { status: 500 }
    );
  }
}
