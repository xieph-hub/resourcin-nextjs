// app/admin/candidates/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: {
    q?: string;
    jobId?: string;
  };
};

export default async function AdminCandidatesPage({ searchParams }: PageProps) {
  const q = (searchParams?.q || "").trim();
  const jobIdFilter = (searchParams?.jobId || "").trim();

  const where: any = {};

  if (q) {
    where.OR = [
      {
        fullname: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  if (jobIdFilter) {
    where.applications = {
      some: {
        jobId: jobIdFilter,
      },
    };
  }

  const [jobs, candidates] = await Promise.all([
    prisma.job.findMany({
      orderBy: { postedAt: "desc" },
      select: {
        id: true,
        title: true,
      },
    }),
    prisma.candidate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            job: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#FFB703] font-semibold">
            Admin · Candidates
          </p>
          <h1 className="text-2xl font-semibold">Talent directory</h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Every candidate that has ever applied through{" "}
            <Link
              href="/jobs"
              className="underline text-slate-100 hover:text-white"
            >
              /jobs
            </Link>
            . Search by name, email, or filter by the roles they&apos;ve
            applied to.
          </p>
        </header>

        {/* Filters */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <form className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_auto] items-end">
            {/* Search */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Search (name or email)
              </label>
              <input
                name="q"
                defaultValue={q}
                placeholder="e.g. Victor, someone@company.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703]"
              />
            </div>

            {/* Job filter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Filter by job
              </label>
              <select
                name="jobId"
                defaultValue={jobIdFilter || ""}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703]"
              >
                <option value="">All jobs</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <Link
                href="/admin/candidates"
                className="inline-flex items-center rounded-full border border-slate-700 px-3 py-2 text-[11px] text-slate-200 hover:border-slate-400 hover:text-slate-50 transition"
              >
                Clear
              </Link>
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-[#FFB703] px-3 py-2 text-[11px] font-semibold text-slate-950 hover:bg-[#ffca3a] transition"
              >
                Apply filters
              </button>
            </div>
          </form>
        </section>

        {/* Candidates table */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Candidates</h2>
            <span className="text-[11px] text-slate-400">
              {candidates.length} record
              {candidates.length === 1 ? "" : "s"}
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 px-6 py-10 text-center text-sm text-slate-400">
              No candidates match your filters yet. Once people start
              applying, they&apos;ll appear here.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-900/70">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-400">
                      Candidate
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-400">
                      Latest activity
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-400">
                      Source & location
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => {
                    const latestApp = candidate.applications[0];

                    const firstSeen =
                      candidate.createdAt instanceof Date
                        ? candidate.createdAt.toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "";

                    const latestAppliedAt =
                      latestApp?.createdAt instanceof Date
                        ? latestApp.createdAt.toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "";

                    return (
                      <tr
                        key={candidate.id}
                        className="border-t border-slate-800/70 hover:bg-slate-900/70"
                      >
                        {/* Candidate */}
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-slate-50">
                            {candidate.fullname ||
                              candidate.email ||
                              "Candidate"}
                          </div>
                          {candidate.email && (
                            <a
                              href={`mailto:${candidate.email}`}
                              className="text-[10px] text-slate-400 hover:text-slate-200"
                            >
                              {candidate.email}
                            </a>
                          )}
                          {firstSeen && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              First seen: {firstSeen}
                            </p>
                          )}
                        </td>

                        {/* Latest activity */}
                        <td className="px-4 py-3 align-top">
                          {latestApp ? (
                            <div className="space-y-1 text-[11px]">
                              <p className="text-slate-100">
                                {latestApp.job?.title || "Unknown role"}
                              </p>
                              <p className="text-slate-400">
                                Stage:{" "}
                                <span className="font-semibold text-slate-100">
                                  {latestApp.stage}
                                </span>
                              </p>
                              {latestAppliedAt && (
                                <p className="text-slate-500">
                                  Applied: {latestAppliedAt}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              No applications on record.
                            </span>
                          )}
                        </td>

                        {/* Source & location */}
                        <td className="px-4 py-3 align-top">
                          <div className="space-y-1 text-[11px]">
                            {candidate.source && (
                              <p>
                                <span className="text-slate-400">
                                  Source:
                                </span>{" "}
                                {candidate.source}
                              </p>
                            )}
                            {candidate.location && (
                              <p>
                                <span className="text-slate-400">
                                  Location:
                                </span>{" "}
                                {candidate.location}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 align-top text-right">
                          <Link
                            href={`/admin/candidates/${candidate.id}`}
                            className="inline-flex items-center rounded-full border border-slate-600 px-3 py-1.5 text-[10px] text-slate-100 hover:border-[#FFB703] hover:text-[#FFB703] transition"
                          >
                            View profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
