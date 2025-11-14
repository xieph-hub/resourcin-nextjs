// app/jobs/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Jobs | Resourcin Human Capital Advisors",
  description:
    "Explore open roles curated by Resourcin Human Capital Advisors. Find your next opportunity and take the next step in your career.",
};

type Job = {
  id: string;
  title: string;
  slug: string;
  location: string;
  type: string;
  company: string;
  department: string;
  summary: string;
};

const jobs: Job[] = [
  {
    id: "1",
    title: "Senior Product Manager (Fintech)",
    slug: "senior-product-manager-fintech",
    location: "Lagos, Nigeria (Hybrid)",
    type: "Full-time",
    company: "Resourcin Client – Fintech",
    department: "Product",
    summary:
      "Lead product strategy and execution for a high-growth fintech client, working closely with engineering, design, and commercial teams.",
  },
  {
    id: "2",
    title: "Business Development Manager",
    slug: "business-development-manager",
    location: "Lagos, Nigeria",
    type: "Full-time",
    company: "Resourcin Client – B2B Services",
    department: "Sales & Business Development",
    summary:
      "Drive new business acquisition, manage key accounts, and build strategic partnerships to accelerate revenue growth.",
  },
  {
    id: "3",
    title: "HR Generalist",
    slug: "hr-generalist",
    location: "Remote (Nigeria)",
    type: "Contract",
    company: "Resourcin Human Capital Advisors",
    department: "People & HR",
    summary:
      "Support recruitment, onboarding, employee relations, and HR operations across multiple client accounts.",
  },
];

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-[#172965] text-white py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80 mb-2">
            Jobs
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Find Your Next Role
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-blue-100 leading-relaxed">
            Explore curated opportunities from Resourcin and our client
            partners. We focus on roles that align skills, ambition, and
            culture—so you can do your best work.
          </p>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-5xl">
          {jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">
                There are no open roles at the moment. Please check back soon or
                follow us on LinkedIn for updates.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {job.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {job.company} · {job.department}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {job.location} · {job.type}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {/* For now, we link to LinkedIn or email.
                          Later, we will replace this with a full apply flow. */}
                      <a
                        href="mailto:hello@resourcin.com?subject=Job%20Application"
                        className="inline-flex items-center rounded-full bg-[#172965] px-4 py-2 text-xs font-medium text-white hover:bg-[#101c44] transition-colors"
                      >
                        Apply via Email
                      </a>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    {job.summary}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
