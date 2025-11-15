// lib/email.ts

const RESEND_API_URL = "https://api.resend.com/emails";

const FROM_EMAIL =
  process.env.RESOURCIN_FROM_EMAIL || "Resourcin <hello@resourcin.com>";

const ADMIN_EMAIL =
  process.env.RESOURCIN_ADMIN_EMAIL || "hello@resourcin.com";

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[email] RESEND_API_KEY not set; skipping email.", {
      to,
      subject,
    });
    return;
  }

  if (!to) {
    console.log("[email] No recipient 'to' provided; skipping email.");
    return;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        "[email] Failed to send email:",
        res.status,
        res.statusText,
        text
      );
    }
  } catch (err) {
    console.error("[email] Error calling Resend API:", err);
  }
}

const STAGE_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  HM: "Hiring Manager Review",
  PANEL: "Panel Interview",
  OFFER: "Offer",
  HIRED: "Hired",
};

function prettyStage(stage: string): string {
  return STAGE_LABELS[stage] || stage;
}

export async function sendCandidateApplicationReceivedEmail(args: {
  to: string;
  candidateName?: string;
  jobTitle: string;
}): Promise<void> {
  const { to, candidateName, jobTitle } = args;

  const safeJobTitle = jobTitle || "your application";
  const subject = `We’ve received your application – ${safeJobTitle}`;
  const name = candidateName?.trim() || "there";

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; font-size: 14px; line-height: 1.6;">
      <p>Hi ${name},</p>
      <p>Thank you for applying for <strong>${safeJobTitle}</strong> via Resourcin.</p>
      <p>Your application has been received and added to our review pipeline. A member of our team (or the hiring manager) will review your profile and get back to you if there’s a potential fit.</p>
      <p style="margin-top: 16px;">Best regards,<br/>Resourcin Talent Team</p>
    </div>
  `;

  await sendEmail({ to, subject, html });
}

export async function sendAdminNewApplicationEmail(args: {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string | null;
  candidateLocation?: string | null;
  jobTitle: string;
  jobSlug: string;
  source?: string | null;
}): Promise<void> {
  if (!ADMIN_EMAIL) {
    return;
  }

  const {
    candidateName,
    candidateEmail,
    candidatePhone,
    candidateLocation,
    jobTitle,
    jobSlug,
    source,
  } = args;

  const subject = `New application – ${jobTitle || "Role"}`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; font-size: 14px; line-height: 1.6;">
      <p>A new application has been submitted via the Resourcin website.</p>
      <p><strong>Job:</strong> ${jobTitle || "Unknown job"}</p>
      <p><strong>Candidate:</strong> ${candidateName || "Unknown"}</p>
      <p><strong>Email:</strong> ${candidateEmail}</p>
      <p><strong>Phone:</strong> ${candidatePhone || "—"}</p>
      <p><strong>Location:</strong> ${candidateLocation || "—"}</p>
      <p><strong>Source:</strong> ${source || "website"}</p>
      <p style="margin-top: 12px;">
        View in admin: <a href="https://www.resourcin.com/admin/applications" target="_blank" rel="noopener noreferrer">Applications dashboard</a>
      </p>
      <p style="margin-top: 16px;">—<br/>Resourcin ATS alerts</p>
    </div>
  `;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject,
    html,
  });
}

export async function sendCandidateStageUpdatedEmail(args: {
  to: string;
  candidateName?: string;
  jobTitle: string;
  newStage: string;
}): Promise<void> {
  const { to, candidateName, jobTitle, newStage } = args;

  const stageLabel = prettyStage(newStage);
  const safeJobTitle = jobTitle || "your application";
  const name = candidateName?.trim() || "there";

  const subject = `Update on your application – ${safeJobTitle}`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; font-size: 14px; line-height: 1.6;">
      <p>Hi ${name},</p>
      <p>There’s an update on your application for <strong>${safeJobTitle}</strong>.</p>
      <p>Your application has moved to: <strong>${stageLabel}</strong>.</p>
      <p style="margin-top: 8px;">If you’re required to take any next steps (e.g. scheduling an interview, completing a test), a member of the team will reach out separately.</p>
      <p style="margin-top: 16px;">Best regards,<br/>Resourcin Talent Team</p>
    </div>
  `;

  await sendEmail({ to, subject, html });
}
