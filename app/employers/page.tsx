import Link from "next/link";

export default function EmployersPage() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          For Employers
        </p>
        <h1 className="text-3xl font-semibold">
          African talent acquisition and employer of record, end to end
        </h1>
        <p className="text-sm text-neutral-400 max-w-3xl">
          We help you design roles, run searches, manage assessments and employ
          talent compliantly across African markets through our TA and EOR
          solutions.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <Link
          href="/services"
          className="group rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 hover:border-emerald-400/70 hover:bg-neutral-900 transition"
        >
          <h2 className="text-base font-semibold mb-2">Services</h2>
          <p className="text-xs text-neutral-400 mb-4">
            Talent Acquisition, Recruitment Process Outsourcing, Employer of
            Record and Executive Search across Africa.
          </p>
          <span className="text-[11px] font-medium text-emerald-300 group-hover:underline">
            Explore services →
          </span>
        </Link>

        <Link
          href="/case-studies"
          className="group rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 hover:border-emerald-400/70 hover:bg-neutral-900 transition"
        >
          <h2 className="text-base font-semibold mb-2">Case studies</h2>
          <p className="text-xs text-neutral-400 mb-4">
            See how we&apos;ve helped founders, HR leaders and CEOs build
            teams, fix hiring bottlenecks and scale operations.
          </p>
          <span className="text-[11px] font-medium text-emerald-300 group-hover:underline">
            View case studies →
          </span>
        </Link>

        <Link
          href="/request-talent"
          className="group rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 hover:border-emerald-400/70 hover:bg-neutral-900 transition"
        >
          <h2 className="text-base font-semibold mb-2">Request talent</h2>
          <p className="text-xs text-neutral-400 mb-4">
            Share your brief for a single hire, a full team or an EOR
            engagement and we&apos;ll get back with a structured plan.
          </p>
          <span className="text-[11px] font-medium text-emerald-300 group-hover:underline">
            Submit a brief →
          </span>
        </Link>
      </section>
    </div>
  );
}
