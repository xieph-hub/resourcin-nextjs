export default function RequestTalentPage() {
  return (
    <main className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-slate-900 mb-4">
          Request Talent
        </h1>
        <p className="text-slate-600 mb-6">
          A focused intake page for employers who already know they want to
          work with Resourcin.
        </p>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500 mb-2">
            We&apos;ll later replace this with a proper intake form:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-500 space-y-1">
            <li>Company & contact details</li>
            <li>Role(s) to hire and seniority</li>
            <li>Location / remote preference</li>
            <li>Budget & timelines</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
