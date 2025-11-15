export default function CandidateDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
        <h2 className="text-xl font-semibold mb-2">Welcome back</h2>
        <p className="text-sm text-neutral-400 mb-4">
          This dashboard will show your profile completeness, recent
          applications and recommended roles.
        </p>
        <div className="text-xs text-neutral-500">
          Next step in the build: connect this to real candidate data so we can
          show:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Profile completeness (%)</li>
            <li>Latest job applications</li>
            <li>Suggested roles from the job board</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
