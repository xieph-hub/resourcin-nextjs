type ClientJobsPageProps = {
  params: {
    slug: string;
  };
};

export default function ClientJobsPage({ params }: ClientJobsPageProps) {
  const { slug } = params;
  const humanName = slug.replace(/-/g, " ");

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Client jobs collection
        </p>
        <h1 className="text-2xl font-semibold">Roles for {humanName}</h1>
        <p className="text-sm text-neutral-400 max-w-xl">
          This page is a placeholder for a future curated jobs page for this
          client. For now, all live roles are listed on the main{" "}
          <a href="/jobs" className="underline text-emerald-300">
            jobs board
          </a>
          .
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 text-sm text-neutral-400">
        We&apos;ll eventually filter and display jobs that belong to{" "}
        <span className="font-medium text-neutral-100">{humanName}</span> here,
        using your ATS data model. Until then, please browse the general
        listings or log into your client workspace.
      </section>
    </div>
  );
}
