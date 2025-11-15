export default function CandidateDocumentsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
        <h2 className="text-xl font-semibold mb-2">Documents</h2>
        <p className="text-sm text-neutral-400 mb-4">
          This is where candidates will upload and manage CVs and supporting
          documents.
        </p>
        <ul className="list-disc pl-5 text-xs text-neutral-400 space-y-1">
          <li>Primary CV file</li>
          <li>Additional CV versions (e.g. Product CV, Data CV)</li>
          <li>Portfolio links or files</li>
          <li>Later: onboarding documents for EOR hires</li>
        </ul>
      </section>
    </div>
  );
}
