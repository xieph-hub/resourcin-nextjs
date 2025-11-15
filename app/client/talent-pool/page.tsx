export default function ClientTalentPoolPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
        <h2 className="text-xl font-semibold mb-2">Talent pool</h2>
        <p className="text-sm text-neutral-400 mb-4">
          This view will let clients search and view a curated subset of your
          wider talent pool.
        </p>
        <ul className="list-disc pl-5 text-xs text-neutral-400 space-y-1">
          <li>Filter by country, function, seniority and industry</li>
          <li>See anonymised candidate cards</li>
          <li>Request intros or add candidates to job shortlists</li>
        </ul>
      </section>
    </div>
  );
}
