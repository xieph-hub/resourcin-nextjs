import EmployerLeadForm from "@/components/EmployerLeadForm";

export const metadata = {
  title: "For Employers | Resourcin",
  description:
    "Africa-focused talent acquisition, employer of record, RPO pods and executive search for high-growth companies.",
};

export default function EmployersPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            For Employers
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            Build Africa-first teams without the hiring chaos.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-gray-600 md:text-base">
            Resourcin partners with founders, People teams, and business leaders
            to design, hire and support talent across graduate programmes,
            mid-level hires, and executive roles—plus Employer of Record and
            embedded RPO pods.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs md:text-sm">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-gray-700">
              Talent Acquisition (Nigeria & Africa)
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-gray-700">
              Employer of Record (EOR)
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-gray-700">
              RPO / Embedded Pods
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-gray-700">
              Executive Search
            </span>
          </div>
        </div>
      </section>

      {/* Layout: services + form */}
      <section className="mx-auto max-w-5xl gap-8 px-4 py-10 md:flex md:px-6 md:py-14">
        {/* Left: services summary */}
        <div className="mb-8 flex-1 space-y-6 md:mb-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              How we support your hiring.
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Whether you&apos;re setting up in Nigeria, scaling across Africa,
              or backfilling critical leadership roles, we plug in as your
              external talent partner.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">
                Talent Acquisition &amp; Search
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                Role scoping, market mapping, candidate sourcing, screening,
                and shortlisting for graduate, mid-level and senior hires.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">
                Employer of Record (EOR)
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                Hire and pay talent in Nigeria and select African markets
                without setting up local entities. We manage contracts, payroll
                and compliance.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">
                RPO &amp; Embedded Pods
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                Dedicated recruiters and People operators embedded into your
                business, running sourcing, interviews, offers and onboarding
                against agreed SLAs.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">
                Executive &amp; Leadership Search
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                Targeted search for Heads of Function, Country Managers and
                C-level, with structured assessments and stakeholder
                management.
              </p>
            </div>
          </div>

          <p className="pt-2 text-xs text-gray-500">
            You don&apos;t need a fully fleshed JD to start. Share what you
            know now, and we&apos;ll help you shape the role and go-to-market.
          </p>
        </div>

        {/* Right: lead form */}
        <div className="flex-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">
              Tell us what you&apos;re hiring for.
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              Share a few details and we&apos;ll follow up with a quick call,
              timelines, and fee options.
            </p>

            <div className="mt-4">
              <EmployerLeadForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
