import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Container from "@/components/Container";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Jobs — Find Your Next Role",
  description:
    "Explore curated job opportunities from leading organizations. Search roles, create a profile, and access expert career advice.",
  alternates: { canonical: SITE_URL + "/jobs" },
};

export const dynamic = "force-dynamic"; // we’ll wire this to a data source in the ATS step

export default async function Page() {
  // Placeholder until ATS module is wired:
  const jobs: Array<{ title: string; location: string; type: string; slug: string }> = [];

  return (
    <main>
      <section className="py-14 md:py-20 bg-white">
        <Container>
          <h1 className="text-3xl md:text-5xl font-bold">Find Your Next Role</h1>
          <p className="mt-4 text-slate-600 max-w-3xl">
            Explore thousands of curated opportunities. Our platform connects you with roles that match your
            skills, aspirations, and values.
          </p>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border p-5">
              <h3 className="font-medium">Search & Apply for Jobs</h3>
              <p className="mt-2 text-slate-600 text-sm">Filter by location, department, and job type.</p>
            </div>
            <div className="rounded-xl border p-5">
              <h3 className="font-medium">Create a Profile & Get Matched</h3>
              <p className="mt-2 text-slate-600 text-sm">Be discoverable when new roles go live.</p>
            </div>
            <div className="rounded-xl border p-5">
              <h3 className="font-medium">Access Expert Career Advice</h3>
              <p className="mt-2 text-slate-600 text-sm">Interview prep, CV tips, and salary insights.</p>
            </div>
          </div>

          {/* Jobs list placeholder */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Open Roles</h2>
              <div className="text-sm text-slate-500">ATS module coming next</div>
            </div>

            {jobs.length === 0 ? (
              <div className="mt-6 rounded-xl border p-6 bg-slate-50 text-slate-600">
                No roles are listed yet. Check back soon or{" "}
                <Link href="/contact" className="text-[#172965] font-medium">
                  join the talent network
                </Link>
                .
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {jobs.map((job) => (
                  <li key={job.slug} className="rounded-xl border p-5 hover:bg-slate-50">
                    <Link href={`/jobs/${job.slug}`} className="font-medium">
                      {job.title}
                    </Link>
                    <p className="text-sm text-slate-600">
                      {job.location} • {job.type}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="px-5 py-3 rounded-xl bg-[#172965] text-white hover:opacity-90">
                Start Your Search
              </Link>
              <Link href="/insights" className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50">
                Read Career Insights
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
