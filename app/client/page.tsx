// app/client/page.tsx

export default function ClientIndexPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Client portal
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Client link incomplete
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          This page is part of the Resourcin client portal.
          <br />
          To view your live roles and candidate pipeline, please use the full
          link shared with you (for example:
          <span className="font-mono text-[11px] text-slate-700">
            {" "}
            /client/resourcin
          </span>
          ).
        </p>
        <p className="mt-4 text-xs text-slate-400">
          If you believe you&apos;ve reached this page in error, please contact
          your Resourcin account manager.
        </p>
      </div>
    </main>
  );
}
