// app/clients/[slug]/page.tsx
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClientPageProps = {
  params: { slug: string };
};

export default async function ClientPortalPage({ params }: ClientPageProps) {
  const { slug } = params;

  // 1) Fetch all jobs linked to this client (via clientSlug)
  const jobs = await prisma.job.findMany({
    where: { clientSlug: slug },
    orderBy: { postedAt: "desc" },
  });

  // If nothing is configured for this slug
  if (!jobs || jobs.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <header className="space-y-2">
            <p className="text-xs font-medium tracking-[0.18em] text-[#6ea0ff] uppercase">
              Client portal
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              This portal is not configured yet
            </h1>
            <p className="text-sm text-slate-400">
              We couldn&apos;t find any active roles tagged for this client
              slug: <span className="font-mono text-slate-200">{slug}</span>.
              Once roles are linked, they&apos;ll appear here automatically.
            </p>
          </header>
        </div>
      </main>
    );
  }

  const clientName = jobs[0].clientName || "Client";
  const clientLabel = clientName === "Client" ? slug : clientName;

  const jobIds = jobs.map((j) => j.id);

  // 2) Fetch applications & candidates for these jobs
  const applications = await prisma.application.findMany({
    where: { jobId: { in: jobIds } },
    include: {
      candidate: true,
      job: {
        select: {
          id: true,
          title: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3) Compute pipeline stats
  const stageCounts: Record<string, number> = {};
  for (const app of applications) {
    const stage = app.stage || "UNKNOWN";
    stageCounts[stage] = (stageCounts[stage] ?? 0) + 1;
  }

  const stageOrder = [
    "APPLIED",
    "SCREENING",
    "HM",
    "PANEL",
    "OFFER",
    "HIRED",
    "REJECTED",
  ];

  const STAGE_LABELS: Record<string, string> = {
    APPLIED: "Applied",
    SCREENING: "Screening",
    HM: "Hiring Manager",
    PANEL: "Panel",
    OFFER: "Offer",
    HIRED: "Hired",
    REJECTED: "Rejected",
  };

  const uniqueCandidateCount = new Set(
    applications.map((a) => a.candidateId)
  ).size;

  const candidatesByJobId: Record<string, number> = {};
  for (const app of applications) {
    const jid = app.jobId;
    candidatesByJobId[jid] = (candidatesByJobId[jid] ?? 0) + 1;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {/* HEADER */}
        <header className="space-y-3">
          <p className="text-xs font-medium tracking-[0.18em] text-[#6ea0ff] uppercase">
            Resourcin® Client Portal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
            {clientLabel} · Talent pipeline
          </h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Live view of roles and candidates we&apos;re running on your behalf.
            This page updates as we receive applications and move candidates
            through the process.
          </p>
        </header>

        {/* SUMMARY CARDS */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] text-slate-400">Open roles</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              {jobs.length}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Roles currently tagged to this client.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] text-slate-400">Total candidates</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              {uniqueCandidateCount}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Unique candidates across all roles.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] text-slate-400">Activity</p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              {stageOrder.map((stage) => {
                const count = stageCounts[stage] ?? 0;
                if (count === 0) return null;
                return (
                  <span
                    key={stage}
                    className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-slate-200"
                  >
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {STAGE_LABELS[stage] ?? stage}: {count}
                  </span>
                );
              })}
              {applications.length === 0 && (
                <span className="text-slate-500">
                  No candidates submitted yet.
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_minmax(0,1.3fr)]">
          {/* ROLES LIST */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">
                Roles in progress
              </h2>
              <p className="text-[11px] text-slate-500">
                Click a role title in your Resourcin admin to see full detail.
              </p>
            </div>

            <div className="space-y-3">
              {jobs.map((job) => {
                const countForJob = candidatesByJobId[job.id] ?? 0;
                return (
                  <div
                    key={job.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">
                          {job.title}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                          {job.location && (
                            <span className="inline-flex items-center rounded-full border border-slate-700 px-2.5 py-1">
                              {job.location}
                            </span>
                          )}
                          {job.type && (
                            <span className="inline-flex items-center rounded-full border border-slate-700 px-2.5 py-1">
                              {job.type}
                            </span>
                          )}
                          {job.department && (
                            <span className="inline-flex items-center rounded-full border border-slate-700 px-2.5 py-1">
                              {job.department}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-1 flex flex-col items-start gap-1 text-[11px] text-slate-400 md:items-end">
                        <span className="rounded-full bg-slate-900 px-3 py-1 font-medium text-slate-100">
                          {countForJob} candidate
                          {countForJob === 1 ? "" : "s"}
                        </span>
                        {job.postedAt && (
                          <span>
                            Opened{" "}
                            {new Date(job.postedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {jobs.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center text-xs text-slate-400">
                  No roles configured for this client yet.
                </div>
              )}
            </div>
          </section>

          {/* CANDIDATES TABLE */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">
                Candidates
              </h2>
              <p className="text-[11px] text-slate-500">
                Snapshot of candidates by latest activity.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80">
              <table className="min-w-full text-left text-[11px] text-slate-300">
                <thead className="bg-slate-900/70 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">Candidate</th>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium">Stage</th>
                    <th className="px-3 py-2 font-medium">Location</th>
                    <th className="px-3 py-2 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-4 text-center text-slate-500"
                      >
                        No candidates yet. As soon as applications come in,
                        they will appear here.
                      </td>
                    </tr>
                  )}

                  {applications.map((app) => {
                    const candidate = app.candidate;
                    const stage = app.stage || "APPLIED";
                    const stageLabel = STAGE_LABELS[stage] ?? stage;

                    return (
                      <tr
                        key={app.id}
                        className="border-t border-slate-800/80 hover:bg-slate-900/60"
                      >
                        <td className="px-3 py-2 align-top">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-50">
                              {candidate?.fullname || "Unnamed candidate"}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {candidate?.email || "No email on file"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex flex-col">
                            <span className="text-slate-100">
                              {app.job?.title || "—"}
                            </span>
                            {app.job?.location && (
                              <span className="text-[10px] text-slate-500">
                                {app.job.location}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-[10px] text-slate-100">
                            {stageLabel}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span className="text-slate-200">
                            {candidate?.location || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span className="text-slate-400">
                            {new Date(app.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
