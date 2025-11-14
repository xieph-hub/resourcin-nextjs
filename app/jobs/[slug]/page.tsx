// app/jobs/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { jobs } from "@/lib/jobs";
import type { Job } from "@/lib/jobs";
import ApplyForm from "@/components/ApplyForm";

type PageParams = {
  params: {
    slug: string;
  };
};

function findJob(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const job = findJob(params.slug);

  if (!job) {
    return {
      title: "Job not found | Resourcin Human Capital Advisors",
      description: "The job you are looking for could not be found.",
    };
  }

  return {
    title: `${job.title} | Jobs | Resourcin Human Capital Advisors`,
    description: job.summary,
    openGraph: {
      title: `${job.title} | Resourcin Human Capital Advisors`,
      description: job.summary,
      type: "article",
    },
  };
}

export default function JobDetailPage({ params }: PageParams) {
  const job = findJob(params.slug);

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-[#172965] text-white py-12 px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80 mb-2">
            Job Opportunity
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            {job.title}
          </h1>
          <p className="text-sm md:text-base text-blue-100 mb-3">
            {job.company} · {job.department}
          </p>
          <p className="text-xs md:text-sm text-blue-100">
            {job.location} · {job.type}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`mailto:hello@resourcin.com?subject=${encodeURIComponent(
                `Application: ${job.title}`
              )}`}
              className="inline-flex items-center rounded-full bg-white px-5 py-2 text-xs font-medium text-[#172965] hover:bg-blue-50 transition-colors"
            >
              Apply via Email
            </a>
            <Link
              href="/jobs"
              className="inline-flex items-center rounded-full border border-blue-100 px-5 py-2 text-xs font-medium text-blue-50 hover:bg-blue-900/50 transition-colors"
            >
              Back to all jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Description */}
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-3">
              Role overview
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {job.description}
            </p>
          </article>

          {/* Apply form */}
          <ApplyForm jobTitle={job.title} jobSlug={job.slug} />
        </div>
      </section>
    </main>
  );
}
