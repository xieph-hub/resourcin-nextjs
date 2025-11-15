export default function RequestTalentPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-8">
    <header className="space-y-3">
      <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
        Request Talent
      </p>
      <h1 className="text-3xl font-semibold">
        Tell us what you&apos;re trying to hire for
      </h1>
      <p className="text-sm text-neutral-400">
        Share a simple brief. We&apos;ll review it and follow up with questions,
        timelines and a proposed search or EOR approach.
      </p>
    </header>

    <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 space-y-4 text-sm text-neutral-200">
      <p>
        In the next phase we&apos;ll connect this to a backend endpoint. For
        now, this page defines the structure:
      </p>
      <ul className="list-disc pl-5 text-xs text-neutral-300 space-y-1">
        <li>Company name and contact details</li>
        <li>Countries you want to hire or employ in</li>
        <li>Role titles, functions and seniority</li>
        <li>Preferred engagement model (TA, RPO, EOR, Exec search)</li>
        <li>Budget band and timelines</li>
      </ul>
      <p className="mt-3 text-xs text-neutral-400">
        You can also reach us directly via the contact page while we finish this
        workflow.
      </p>
    </section>
  </div>
  );
}
