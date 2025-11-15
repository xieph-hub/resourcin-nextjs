import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function JobsPage() {
  // Fetch jobs from the database
  const jobs = await prisma.job.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Jobs
        </p>
        <h1 className="text-3xl font-semibold">Open roles</h1>
        <p className="text-sm text-neutral-400 max-w-2xl">
          Browse roles curated by Resourcin across Africa and beyond. This list
          is now coming directly from your database.
        </p>
      </header>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 text-sm text-neutral-400">
          No open roles yet. Once you add jobs in Supabase, they&apos;ll appear
          here automatically.
        </div>
      ) : (
        <section className="space-y-4">
          <div className="text-xs text-neutral-500">
            Showing {jobs.length} open role{jobs.length === 1 ? "" : "s"}
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5 hover:border-emerald-400/70 hover:bg-neutral-900 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="hover:underline"
                      >
                        {job.title}
                      </Link>
                    </h2>

                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-neutral-400">
                      {job.location && (
                        <span className="rounded-full border border-neutral-800 px-2 py-0.5">
                          {job.location}
                        </span>
                      )}
                      {job.level && (
                        <span className="rounded-full border border-neutral-800 px-2 py-0.5">
                          {job.level}
                        </span>
                      )}
                      {job.function && (
                        <span className="rounded-full border border-neutral-800 px-2 py-0.5">
                          {job.function}
                        </span>
                      )}
                      {job.remoteOption && (
                        <span className="rounded-full border border-neutral-800 px-2 py-0.5">
                          {job.remoteOption}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-neutral-500">
                    Status:{" "}
                    <span className="text-emerald-300 font-medium">
                      {job.status}
                    </span>
                  </div>
                </div>

                {job.summary && (
                  <p className="mt-3 text-sm text-neutral-400">
                    {job.summary}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
