// app/jobs/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import ApplyForm from "@/components/ApplyForm";

export const dynamic = "force-dynamic";

type JobPageProps = {
  params: { slug: string };
};

export default async function JobPage({ params }: JobPageProps) {
  // Fetch by slug + published (safer than findUnique right now)
  const job = await prisma.job.findFirst({
    where: {
      slug: params.slug,
      isPublished: true,
    },
  });

  // If no job, show an in-page message (NOT Next.js 404)
  if (!job) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">
            Job not found
          </h1>
          <p className="text-sm text-slate-600">
            This role may no longer be available, or the link might be
            incorrect.
          </p>
        </section>
      </main>
    );
  }

  const postedDate = job.postedAt
    ? job.postedAt.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Open role
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
            {job.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            {job.location && (
              <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1">
                {job.location}
              </span>
            )}
            {job.type && (
              <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1">
                {job.type}
              </span>
            )}
            {job.department && (
              <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1">
                {job.department}
              </span>
            )}
            {postedDate && (
              <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1">
                Posted {postedDate}
              </span>
            )}
          </div>
        </div>

        {/* Layout: description + apply form */}
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          {/* Description */}
          <article className="prose prose-sm max-w-none text-slate-800 prose-headings:text-slate-900 prose-a:text-[#172965]">
            <p className="whitespace-pre-line leading-relaxed">
              {job.description}
            </p>
          </article>

          {/* Apply form */}
          <ApplyForm jobTitle={job.title} jobId={job.id} />
        </div>
      </section>
    </main>
  );
}
