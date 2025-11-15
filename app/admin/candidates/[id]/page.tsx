// app/admin/candidates/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function CandidateDetailPage({ params }: PageProps) {
  const id = params.id;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              location: true,
              department: true,
              type: true,
            },
          },
        },
      },
    },
  });

  if (!candidate) {
    notFound();
  }

  const firstSeen =
    candidate.createdAt instanceof Date
      ? candidate.createdAt.toLocaleString("en-NG", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-slate-400 flex items-center gap-2">
          <Link href="/admin" className="hover:text-slate-100 hover:underline">
            Admin
          </Link>
          <span>/</span>
          <Link
            href="/admin/candidates"
            className="hover:text-slate-100 hover:underline"
          >
            Candidates
          </Link>
          <span>/</span>
          <span className="text-slate-200">
            {candidate.fullname || candidate.email || "Candidate"}
          </span>
        </nav>

        {/* Header */}
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#FFB703] font-semibold">
            Candidate profile
          </p>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">
                {candidate.fullname || candidate.email || "Candidate"}
              </h1>
              {candidate.location && (
                <p className="text-sm text-slate-300">
                  {candidate.location}
                </p>
              )}
              {firstSeen && (
                <p className="text-[11px] text-slate-400">
                  First seen: {firstSeen}
                </p>
              )}
            </div>

            {/* Quick summary */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-[11px] space-y-1">
              <p className="text-slate-400">Summary</p>
              <p className="text-slate-100">
                {candidate.applications.length} application
                {candidate.applications.length === 1 ? "" : "s"} on record
              </p>
              {candidate.source && (
                <p className="text-slate-400">
                  Source:{" "}
                  <span className="text-slate-100">{candidate.source}</span>
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Main layout */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,2fr)]">
          {/* Left: Candidate info */}
          <section className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <h2 className="text-sm font-semibold">Contact & basics</h2>
              <div className="space-y-2 text-xs text-slate-200">
                {candidate.fullname && (
                  <p>
                    <span className="text-slate-400">Name:</span>{" "}
                    {candidate.fullname}
                  </p>
                )}
                {candidate.email && (
                  <p>
                    <span className="text-slate-400">Email:</span>{" "}
                    <a
                      href={`mailto:${candidate.email}`}
                      className="underline hover:text-slate-50"
                    >
                      {candidate.email}
                    </a>
                  </p>
                )}
                {candidate.phone && (
                  <p>
                    <span className="text-slate-400">Phone:</span>{" "}
                    <a
                      href={`tel:${candidate.phone}`}
                      className="hover:text-slate-50"
                    >
                      {candidate.phone}
                    </a>
                  </p>
                )}
                {candidate.location && (
                  <p>
                    <span className="text-slate-400">Location:</span>{" "}
                    {candidate.location}
                  </p>
                )}
                {candidate.source && (
                  <p>
                    <span className="text-slate-400">Source:</span>{" "}
                    {candidate.source}
                  </p>
                )}
              </div>

              <div className="pt-3 space-y-1">
                <p className="text-[11px] text-slate-400">CV / Resume</p>
                {candidate.resumeUrl ? (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border border-slate-600 px-3 py-1.5 text-[11px] hover:border-[#FFB703] hover:text-[#FFB703] transition"
                  >
                    Open CV in new tab
                  </a>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    No CV URL stored for this candidate.
                  </p>
                )}
              </div>
            </div>

            {candidate.rawText && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <h2 className="text-sm font-semibold">Parsed profile</h2>
                <p className="text-[11px] text-slate-400">
                  Any raw text that was parsed from a CV or form input.
                </p>
                <pre className="whitespace-pre-wrap text-[11px] text-slate-200 bg-slate-950/60 rounded-lg p-3 border border-slate-800">
                  {candidate.rawText}
                </pre>
              </div>
            )}
          </section>

          {/* Right: Applications history */}
          <section className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center justify-between">
                Application history
                <span className="text-[11px] text-slate-400">
                  {candidate.applications.length} record
                  {candidate.applications.length === 1 ? "" : "s"}
                </span>
              </h2>

              {candidate.applications.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  This candidate has no applications yet.
                </p>
              ) : (
                <ol className="relative border-l border-slate-700/70 ml-2 space-y-4 text-xs">
                  {candidate.applications.map((app) => {
                    const appliedAt =
                      app.createdAt instanceof Date
                        ? app.createdAt.toLocaleString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";

                    return (
                      <li key={app.id} className="ml-4">
                        <div className="absolute -left-[9px] mt-1 h-2 w-2 rounded-full bg-[#FFB703]" />
                        <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-100">
                              {app.job?.title || "Application"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Stage:{" "}
                              <span className="font-semibold text-slate-100">
                                {app.stage}
                              </span>
                            </p>
                            {app.job?.location && (
                              <p className="text-[11px] text-slate-400">
                                Location: {app.job.location}
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            {appliedAt && (
                              <p className="text-[11px] text-slate-400">
                                Applied: {appliedAt}
                              </p>
                            )}
                            <div className="flex gap-2 justify-end">
                              <Link
                                href={`/admin/applications/${app.id}`}
                                className="inline-flex items-center rounded-full border border-slate-600 px-3 py-1.5 text-[10px] text-slate-100 hover:border-[#FFB703] hover:text-[#FFB703] transition"
                              >
                                View application
                              </Link>
                              {app.job?.slug && (
                                <Link
                                  href={`/jobs/${app.job.slug}`}
                                  className="inline-flex items-center rounded-full border border-slate-600 px-3 py-1.5 text-[10px] text-slate-100 hover:border-[#FFB703] hover:text-[#FFB703] transition"
                                >
                                  Public posting
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
