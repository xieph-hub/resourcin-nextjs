// app/client/[clientSlug]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type PageProps = {
  params: {
    clientSlug: string;
  };
};

export const dynamic = "force-dynamic";

export default async function ClientDashboard({ params }: PageProps) {
  const { clientSlug } = params;

  // Fetch all published jobs for this client, plus their applications
  const jobs = await prisma.job.findMany({
    where: {
      clientSlug,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      department: true,
      location: true,
      type: true,
      postedAt: true,
      clientName: true,
      applications: {
        select: {
          id: true,
          stage: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      postedAt: "desc",
    },
  });

  // Handle "no jobs" early
  if (!jobs.length) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Client portal
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Jobs dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              No published roles are currently associated with{" "}
              <span className="font-medium text-slate-800">{clientSlug}</span>.
              If you think this is an error, please contact your Resourcin
              account manager.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            <p>No active jobs right now.</p>
          </div>
        </div>
      </main>
    );
  }

  const clientName = jobs[0]?.clientName || clientSlug;

  // Simple metrics
  const totalJobs = jobs.length;
  const totalApplications = jobs.reduce(
    (sum, job) => sum + job.applications.length,
    0
  );

  const stageCounts = jobs.reduce<Record<string, number>>((acc, job) => {
    for (const app of job.applications) {
      const key = app.stage || "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const stages = Object.entries(stageCounts).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Client portal
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {clientName} – Jobs & Pipeline
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            A live view of your open roles and candidate pipeline. For deeper
            changes (e.g. job copy, compensation, locations), please reach out
            to your Resourcin contact.
          </p>
        </header>

        {/* Top metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">Open roles</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {totalJobs}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">
              Total candidates
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {totalApplications}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">
              Pipeline by stage
            </p>
            {stages.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No candidates yet.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {stages.map(([stage, count]) => (
                  <span
                    key={stage}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700"
                  >
                    {stage}:{" "}
                    <span className="ml-1 rounded-full bg-slate-800 px-2 py-[2px] text-[10px] font-semibold text-white">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Jobs table */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Open roles ({totalJobs})
            </h2>
            <p className="text-[11px] text-slate-400">
              Showing roles published via Resourcin
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {jobs.map((job) => {
              const count = job.applications.length;

              const latestApplication = job.applications
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )[0];

              return (
                <div
                  key={job.id}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {job.title}
                      </p>
                      {job.department && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                          {job.department}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {job.location || "Location flexible"} ·{" "}
                      {job.type || "Full-time"} · Posted{" "}
                      {job.postedAt.toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {count === 0
                        ? "No candidates yet."
                        : `${count} candidate${count === 1 ? "" : "s"} in
                          pipeline${
                            latestApplication
                              ? ` · latest activity on ${new Date(
                                  latestApplication.createdAt
                                ).toLocaleDateString()}`
                              : ""
                          }`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                    >
                      View public job
                    </Link>
                    <Link
                      href={`/admin/applications?jobId=${job.id}`}
                      className="inline-flex items-center rounded-full bg-[#172965] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#101c44]"
                    >
                      View pipeline (internal)
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
