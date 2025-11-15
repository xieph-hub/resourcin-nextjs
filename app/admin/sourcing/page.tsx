// app/admin/sourcing/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Server action: create / update candidate + (optionally) attach to a job
export async function createSourcedCandidate(formData: FormData) {
  "use server";

  const nameRaw = (formData.get("name") as string | null) ?? "";
  const emailRaw = (formData.get("email") as string | null) ?? "";
  const phoneRaw = (formData.get("phone") as string | null) ?? "";
  const locationRaw = (formData.get("location") as string | null) ?? "";
  const sourceRaw = (formData.get("source") as string | null) ?? "";
  const jobIdRaw = (formData.get("jobId") as string | null) ?? "";
  const rawProfileRaw = (formData.get("rawProfile") as string | null) ?? "";

  const name = nameRaw.trim();
  const email = emailRaw.trim().toLowerCase();
  const phone = phoneRaw.trim();
  const location = locationRaw.trim();
  const source = (sourceRaw.trim() || "sourced").toLowerCase();
  const jobId = jobIdRaw.trim();
  const rawProfile = rawProfileRaw.trim();

  // Basic guard: we need at least *something* to identify the person
  if (!name && !email) {
    redirect("/admin/sourcing?error=missing");
  }

  // 1) Find an existing candidate by email (if provided)
  let candidate = null as any;

  if (email) {
    candidate = await prisma.candidate.findFirst({
      where: { email },
    });
  }

  // 2) Update existing candidate OR create a new one
  if (candidate) {
    candidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        fullname: name || candidate.fullname,
        phone: phone || candidate.phone,
        location: location || candidate.location,
        source,
        rawText: rawProfile || candidate.rawText,
      },
    });
  } else {
    candidate = await prisma.candidate.create({
      data: {
        fullname: name || null,
        email,
        phone: phone || null,
        location: location || null,
        source,
        rawText: rawProfile || null,
        // resumeUrl stays null here; if you ever add later you can update
      },
    });
  }

  // 3) Optionally attach them to a job as an Application
  if (jobId) {
    await prisma.application.create({
      data: {
        stage: "APPLIED", // keep using your existing stage enum
        candidate: { connect: { id: candidate.id } },
        job: { connect: { id: jobId } },
      },
    });
  }

  // 4) Drop you straight into their profile
  redirect(`/admin/candidates/${candidate.id}`);
}

export default async function AdminSourcingPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const jobs = await prisma.job.findMany({
    orderBy: { postedAt: "desc" },
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      location: true,
      department: true,
    },
  });

  const hasError = searchParams?.error === "missing";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#FFB703] font-semibold">
            Admin · Sourcing
          </p>
          <h1 className="text-2xl font-semibold">Add sourced candidate</h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Paste details from LinkedIn, a CV, or a referral email. We&apos;ll
            create the candidate record and, if you select a job, also create an
            application.
          </p>
        </header>

        {/* Card */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          {hasError && (
            <p className="text-[11px] text-red-400 mb-2">
              Please provide at least a name or an email.
            </p>
          )}

          <form action={createSourcedCandidate} className="space-y-6">
            {/* Top grid: basic info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Full name
                </label>
                <input
                  name="name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703]"
                  placeholder="e.g. Adaeze Okafor"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703]"
                  placeholder="candidate@company.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703]"
                  placeholder="+234…"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Location
                </label>
                <input
                  name="location"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703]"
                  placeholder="Lagos, Nigeria"
                />
              </div>
            </div>

            {/* Source + job select */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Source
                </label>
                <select
                  name="source"
                  defaultValue="linkedin"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703]"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="manual">Manual / other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Attach to job (optional)
                </label>
                <select
                  name="jobId"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703]"
                >
                  <option value="">Don&apos;t attach yet</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                      {job.location ? ` · ${job.location}` : ""}
                      {job.department ? ` · ${job.department}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Raw snippet / notes */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Profile snippet / notes
              </label>
              <textarea
                name="rawProfile"
                rows={6}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703] resize-y"
                placeholder="Paste LinkedIn About section, CV summary, or your own notes here…"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                This is stored on the candidate profile under &quot;Parsed
                profile&quot; so you can quickly recall why they looked
                interesting.
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-[#FFB703] px-5 py-2.5 text-[11px] font-semibold text-slate-950 hover:bg-[#ffca3a] transition"
              >
                Save candidate
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
