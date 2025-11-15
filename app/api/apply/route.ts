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

    // 1️⃣ Parse body – multipart (file upload) OR JSON
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

    // 3️⃣ Find job by ID only
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
      // Light update with latest info
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

    // 5️⃣ Try Supabase CV upload (non-blocking)
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
          .from("resourcin-uploads") // 🔒 bucket name – make sure it matches Supabase
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

    if (resumeUrl) {
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { resumeUrl },
      });
    }

    // 6️⃣ Create Application (lean, schema-safe)
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

    // 7️⃣ Resend email notifications (non-blocking)
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Resourcin <hello@resourcin.com>";
    const adminEmail =
      process.env.RESOURCIN_ADMIN_EMAIL || "hello@resourcin.com";

    if (resendApiKey) {
      const jobTitle = job.title;
      const candidateName = candidate.fullname || name || "";

      // 7a. Candidate confirmation email
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [normalizedEmail],
            subject: `We’ve received your application – ${jobTitle}`,
            html: `
              <p>Hi ${candidateName},</p>
              <p>Thank you for applying for the <strong>${jobTitle}</strong> role via Resourcin.</p>
              <p>We’ll review your profile and get in touch if there’s a strong match.</p>
              ${
                cvWarning && !resumeUrl
                  ? `<p><strong>Note:</strong> We could not automatically save your CV. Please reply to this email with your CV attached.</p>`
                  : ""
              }
              <p>Best,<br/>Resourcin Team</p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Resend candidate email error:", emailErr);
      }

      // 7b. Admin notification email
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [adminEmail],
            subject: `New application – ${jobTitle}`,
            html: `
              <p>A new application has been received for <strong>${jobTitle}</strong>.</p>
              <ul>
                <li><strong>Name:</strong> ${candidateName}</li>
                <li><strong>Email:</strong> ${normalizedEmail}</li>
                ${
                  phone
                    ? `<li><strong>Phone:</strong> ${phone}</li>`
                    : ""
                }
                ${
                  location
                    ? `<li><strong>Location:</strong> ${location}</li>`
                    : ""
                }
              </ul>
              <p>Log into the Resourcin admin dashboard to review this candidate.</p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Resend admin email error:", emailErr);
      }
    } else {
      console.warn("RESEND_API_KEY is not set – skipping email notifications.");
    }

    // 8️⃣ Final response to the frontend
    return NextResponse.json(
      {
        ok: true,
        message,
        applicationId: application.id,
      },
      { status: 200 }
    );
  } catch (err) {
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
