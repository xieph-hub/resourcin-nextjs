// app/jobs/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ApplyForm from "@/components/ApplyForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

type JobPageProps = {
  params: {
    slug: string;
  };
};

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = params;

  const job = await prisma.job.findUnique({
    where: { slug },
  });

  if (!job || !job.isPublished) {
    // Hide unpublished / missing roles from public
    notFound();
  }

  const posted =
    job.postedAt instanceof Date
      ? job.postedAt.toLocaleDateString("en-NG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

  const jobUrl = `https://www.resourcin.com/jobs/${job.slug}`;
  const encodedUrl = encodeURIComponent(jobUrl);
  const encodedTitle = encodeURIComponent(job.title);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-slate-500 flex items-center gap-2">
          <Link href="/jobs" className="hover:text-[#172965]">
            Jobs
          </Link>
          <span>/</span>
          <span className="text-slate-700">{job.title}</span>
        </nav>

        {/* Header + meta */}
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#172965] font-semibold">
            Role
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {job.title}
          </h1>

          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
            {job.location && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">
                {job.location}
              </span>
            )}
            {job.type && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">
                {job.type}
              </span>
            )}
            {job.department && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">
                {job.department}
              </span>
            )}
            {posted && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">
                Posted {posted}
              </span>
            )}
          </div>

          {/* Share */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span>Share this role:</span>
            <div className="flex gap-2">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-1 hover:border-[#172965] hover:text-[#172965] transition"
              >
                Twitter / X
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-1 hover:border-[#172965] hover:text-[#172965] transition"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </header>

        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* JD */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            {job.excerpt && (
              <p className="mb-4 text-sm font-medium text-slate-800">
                {job.excerpt}
              </p>
            )}

            <div className="mt-4 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {job.description || "No description provided yet."}
            </div>
          </section>

          {/* Apply card */}
          <ApplyForm jobTitle={job.title} jobId={job.id} />
        </div>
      </div>
    </main>
  );
}
