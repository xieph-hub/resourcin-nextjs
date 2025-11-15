export default function ClientEorPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
        <h2 className="text-xl font-semibold mb-2">EOR employees</h2>
        <p className="text-sm text-neutral-400 mb-4">
          This page will show employees engaged via Resourcin as Employer of
          Record.
        </p>
        <ul className="list-disc pl-5 text-xs text-neutral-400 space-y-1">
          <li>Employee name, role and country</li>
          <li>Status (Onboarding, Active, Offboarded)</li>
          <li>Key dates (start, probation, end)</li>
        </ul>
      </section>
    </div>
  );
}
