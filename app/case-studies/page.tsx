export default function CaseStudiesPage() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Case studies
        </p>
        <h1 className="text-3xl font-semibold">
          Stories from founders, HR leaders and CEOs
        </h1>
        <p className="text-sm text-neutral-400 max-w-3xl">
          This section will showcase specific hiring, RPO and EOR projects
          we&apos;ve delivered across Africa. You can start with 2–3 flagship
          stories and expand over time.
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 text-sm text-neutral-400">
        <p className="mb-2">
          For now, this is a placeholder. Later we&apos;ll render real case
          studies from content or your CMS, for example:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Scaling a fintech&apos;s engineering team across Nigeria, Ghana and
            Kenya.
          </li>
          <li>
            Building a remote customer support pod for a global SaaS company via
            EOR.
          </li>
          <li>
            Running a graduate programme for a pan-African bank.
          </li>
        </ul>
      </section>
    </div>
  );
}
