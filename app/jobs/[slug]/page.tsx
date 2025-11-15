import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";

type JobPageProps = {
  params: {
    slug: string;
  };
};

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = params;

  const job = await prisma.job.findUnique({
    where: { slug },
    include: {
      client: true, // ClientCompany, if linked
    },
  });

  // If no job or job is not open, 404
  if (!job || job.status !== "open") {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-8">
      <nav className="text-xs text-neutral-500 mb-2">
        <Link href="/jobs" className="hover:underline">
          Jobs
        </Link>{" "}
        / <span className="text-neutral-300">{job.title}</span>
      </nav>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Job details
        </p>
        <h1 className="text-3xl font-semibold">{job.title}</h1>

        <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400">
          {job.client?.name && (
            <span className="rounded-full border border-neutral-800 px-2 py-0.5">
              {job.client.name}
            </span>
          )}
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
          {job.jobType && (
            <span className="rounded-full border border-neutral-800 px-2 py-0.5">
              {job.jobType}
            </span>
          )}
          {job.remoteOption && (
            <span className="rounded-full border border-neutral-800 px-2 py-0.5">
              {job.remoteOption}
            </span>
          )}
          {job.function && (
            <span className="rounded-full border border-neutral-800 px-2 py-0.5">
              {job.function}
            </span>
          )}
          {job.industry && (
            <span className="rounded-full border border-neutral-800 px-2 py-0.5">
              {job.industry}
            </span>
          )}
        </div>

        {job.salaryCurrency && (job.salaryMin || job.salaryMax) && (
          <p className="text-sm text-neutral-300">
            Compensation:{" "}
            <span className="font-medium">
              {job.salaryCurrency}{" "}
              {job.salaryMin
                ? job.salaryMax && job.salaryMax !== job.salaryMin
                  ? `${job.salaryMin.toLocaleString()} – ${job.salaryMax?.toLocaleString()}`
                  : job.salaryMin.toLocaleString()
                : job.salaryMax?.toLocaleString()}
            </span>
          </p>
        )}
      </header>

      {job.summary && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-neutral-200">Summary</h2>
          <p className="text-sm text-neutral-300">{job.summary}</p>
        </section>
      )}

      {job.description && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-neutral-200">Role</h2>
          <div className="prose prose-invert max-w-none text-sm">
            <p className="whitespace-pre-line">{job.description}</p>
          </div>
        </section>
      )}

      {job.requirements && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-neutral-200">
            Requirements
          </h2>
          <div className="prose prose-invert max-w-none text-sm">
            <p className="whitespace-pre-line">{job.requirements}</p>
          </div>
        </section>
      )}

      <section className="pt-4 border-t border-neutral-900 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-neutral-500">
          Ready to apply? You can submit your details on the main jobs page or
          via our talent network while we hook up inline applications here.
        </p>
        <div className="flex gap-2">
          <Link
            href="/jobs"
            className="text-xs rounded-full border border-neutral-700 px-4 py-1 hover:border-emerald-400/80 hover:text-emerald-200 transition"
          >
            Back to jobs
          </Link>
          <Link
            href="/candidate"
            className="text-xs rounded-full bg-emerald-500/90 text-neutral-900 px-4 py-1 font-medium hover:bg-emerald-400 transition"
          >
            Join talent network
          </Link>
        </div>
      </section>
    </div>
  );
}
