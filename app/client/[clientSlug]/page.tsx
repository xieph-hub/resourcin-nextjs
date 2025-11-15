type ClientPageProps = {
  params: {
    clientSlug: string;
  };
};

export default function ClientPublicPage({ params }: ClientPageProps) {
  const { clientSlug } = params;

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Client microsite
        </p>
        <h1 className="text-2xl font-semibold">
          Jobs for {clientSlug.replace(/-/g, " ")}
        </h1>
        <p className="text-sm text-neutral-400 max-w-xl">
          This page is a placeholder for a future branded jobs page for this
          client. For now, all live roles are listed on the main{" "}
          <a href="/jobs" className="underline text-emerald-300">
            jobs board
          </a>
          .
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 text-sm text-neutral-400">
        We&apos;ll eventually show roles filtered for{" "}
        <span className="font-medium text-neutral-100">{clientSlug}</span> here,
        powered by your ATS. For now, you can continue browsing the full jobs
        list or log into your client workspace.
      </section>
    </div>
  );
}
