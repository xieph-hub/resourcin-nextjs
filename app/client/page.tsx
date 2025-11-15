export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
        <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
        <p className="text-sm text-neutral-400 mb-4">
          This dashboard will summarise your open roles, candidates in process
          and active EOR employees.
        </p>
        <ul className="list-disc pl-5 text-xs text-neutral-400 space-y-1">
          <li>Open roles and their status</li>
          <li>Pipeline health (candidates per stage)</li>
          <li>Overview of EOR headcount by country</li>
        </ul>
      </section>
    </div>
  );
}
