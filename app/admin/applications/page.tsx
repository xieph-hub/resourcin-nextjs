// app/admin/applications/page.tsx
import { prisma } from "@/lib/prisma";
import { updateApplicationStage } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

type AdminApplicationsPageProps = {
  searchParams?: {
    jobId?: string;
    stage?: string;
    q?: string;
  };
};

export default async function AdminApplicationsPage({
  searchParams,
}: AdminApplicationsPageProps) {
  const jobIdFilter = (searchParams?.jobId || "").trim();
  const stageFilter = (searchParams?.stage || "").trim();
  const q = (searchParams?.q || "").trim();

  const where: any = {};

  if (jobIdFilter) {
    where.jobId = jobIdFilter;
  }

  if (stageFilter) {
    where.stage = stageFilter;
  }

  if (q) {
    where.OR = [
      {
        candidate: {
          fullname: {
            contains: q,
            mode: "insensitive",
          },
        },
      },
      {
        candidate: {
          email: {
            contains: q,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const [jobs, applications] = await Promise.all([
    prisma.job.findMany({
      orderBy: { postedAt: "desc" },
      select: { id: true, title: true },
    }),
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        candidate: {
          select: {
            id: true,
            fullname: true,
            email: true,
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
            Admin · Applications
          </p>
          <h1 className="text-2xl font-semibold">Application pipeline</h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Every inbound application from{" "}
            <Link
              href="/jobs"
              className="underline text-slate-100 hover:text-white"
            >
              /jobs
            </Link>{" "}
            and your external campaigns. Filter by role, stage, or candidate
            identity and move people across your pipeline.
          </p>
        </header>

        {/* Filters */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <form className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] items-end">
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
                Job
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

            {/* Stage filter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Stage
              </label>
              <select
                name="stage"
                defaultValue={stageFilter || ""}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703]"
              >
                <option value="">All stages</option>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <Link
                href="/admin/applications"
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

        {/* Applications table */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Applications</h2>
            <span className="text-[11px] text-slate-400">
              {applications.length} record
              {applications.length === 1 ? "" : "s"}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 px-6 py-10 text-center text-sm text-slate-400">
              No applications match your filters yet. Once candidates apply
              through{" "}
              <Link
                href="/jobs"
                className="underline text-slate-100 hover:text-white"
              >
                /jobs
              </Link>
              , they&apos;ll appear here.
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
                      Role
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-400">
                      Stage
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-400">
                      Applied
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const candidateName =
                      app.candidate?.fullname ||
                      app.candidate?.email ||
                      "Candidate";

                    const appliedDate =
                      app.createdAt instanceof Date
                        ? app.createdAt.toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "";

                    return (
                      <tr
                        key={app.id}
                        className="border-t border-slate-800/70 hover:bg-slate-900/70"
                      >
                        {/* Candidate */}
                        <td className="px-4 py-2 align-top">
                          <div className="font-medium text-slate-50">
                            {candidateName}
                          </div>
                          {app.candidate?.email && (
                            <a
                              href={`mailto:${app.candidate.email}`}
                              className="text-[10px] text-slate-400 hover:text-slate-200"
                            >
                              {app.candidate.email}
                            </a>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-2 align-top">
                          {app.job ? (
                            <div className="space-y-1">
                              <div className="text-slate-100">
                                {app.job.title}
                              </div>
                              {app.job.slug && (
                                <Link
                                  href={`/jobs/${app.job.slug}`}
                                  className="text-[10px] text-[#FFB703] hover:text-[#ffca3a] underline"
                                >
                                  View public posting
                                </Link>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Stage (inline update) */}
                        <td className="px-4 py-2 align-top">
                          <form
                            action={updateApplicationStage}
                            className="inline-flex items-center gap-2"
                          >
                            <input type="hidden" name="id" value={app.id} />
                            <select
                              name="stage"
                              defaultValue={app.stage}
                              className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703]"
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded-full border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:border-[#FFB703] hover:text-[#FFB703] transition"
                            >
                              Save
                            </button>
                          </form>
                        </td>

                        {/* Applied */}
                        <td className="px-4 py-2 align-top text-slate-300">
                          {appliedDate || "—"}
                        </td>

                        {/* Actions (placeholder for future detail view) */}
                        <td className="px-4 py-2 align-top text-right">
                          <span className="text-[10px] text-slate-500">
                            More coming soon
                          </span>
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
