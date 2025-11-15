// app/jobs/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplyForm from "@/components/ApplyForm";

type JobPageProps = {
  params: { slug: string };
};

export default async function JobPage({ params }: JobPageProps) {
  const job = await prisma.job.findUnique({
    where: { slug: params.slug },
  });

  if (!job || !job.isPublished) {
    notFound();
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
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Open role
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
            {job.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1">
              {job.location}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1">
              {job.type}
            </span>
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

        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          <article className="prose prose-sm max-w-none text-slate-800 prose-headings:text-slate-900 prose-a:text-[#172965]">
            <p className="whitespace-pre-line leading-relaxed">
              {job.description}
            </p>
          </article>

          <ApplyForm jobTitle={job.title} jobId={job.id} />
        </div>
      </section>
    </main>
  );
}
