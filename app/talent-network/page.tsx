import Link from "next/link";

export default function TalentNetworkPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Talent Network
        </p>
        <h1 className="text-3xl font-semibold">
          Join the Resourcin African talent network
        </h1>
        <p className="text-sm text-neutral-400">
          Share your profile with us once. We&apos;ll consider you for graduate,
          mid-level and leadership roles that match your skills and preferences.
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 space-y-4">
        <p className="text-xs text-neutral-400">
          In the next phase we&apos;ll connect this form directly to your ATS /
          database. For now, this is the structure we&apos;ll collect:
        </p>

        <ul className="list-disc pl-5 text-xs text-neutral-300 space-y-1">
          <li>Basic details: name, email, phone, city &amp; country</li>
          <li>Level: graduate, mid-level, senior or executive</li>
          <li>Functions you&apos;re interested in (e.g. Product, HR, Finance)</li>
          <li>Preferred locations and salary expectations</li>
          <li>Upload CV</li>
        </ul>

        <div className="mt-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/60 p-4 text-xs text-neutral-400">
          <p className="mb-2">
            Next step in the build: we&apos;ll add a real form here that creates
            your candidate profile and drops you into the talent pool.
          </p>
          <p>
            For now, you can still{" "}
            <Link href="/jobs" className="underline text-emerald-300">
              browse and apply for open roles
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
