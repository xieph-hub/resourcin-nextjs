import type { ReactNode } from "react";
import Link from "next/link";

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-[220px,1fr]">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Employer
            </p>
            <h1 className="text-lg font-semibold mt-1">
              Client workspace
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              View jobs, pipelines and (later) EOR teams in one place.
            </p>
          </div>

          <nav className="space-y-2 text-sm">
            <Link
              href="/client"
              className="block rounded-md px-3 py-2 hover:bg-neutral-900"
            >
              Dashboard
            </Link>
            <Link
              href="/client/jobs"
              className="block rounded-md px-3 py-2 hover:bg-neutral-900"
            >
              Jobs
            </Link>
            <Link
              href="/client/talent-pool"
              className="block rounded-md px-3 py-2 hover:bg-neutral-900"
            >
              Talent pool
            </Link>
            <Link
              href="/client/eor"
              className="block rounded-md px-3 py-2 hover:bg-neutral-900"
            >
              EOR
            </Link>
            <Link
              href="/client/settings"
              className="block rounded-md px-3 py-2 hover:bg-neutral-900"
            >
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
