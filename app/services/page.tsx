import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Container from "@/components/Container";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services — Talent Acquisition & Employer of Record (EOR)",
  description:
    "Build high-performing teams with precision. Resourcin delivers Talent Acquisition (RPO, Executive Search, Staffing, Employer Branding) and Employer of Record (EOR) services for compliant, scalable hiring.",
  alternates: { canonical: SITE_URL + "/services" },
};

export default function Page() {
  return (
    <main>
      {/* Hero */}
      <section className="py-14 md:py-20 bg-white">
        <Container>
          <h1 className="text-3xl md:text-5xl font-bold">Services</h1>
          <p className="mt-4 text-slate-600 max-w-3xl">
            Build high-performing teams with <span className="font-semibold">precision</span>. Our solutions
            combine advanced technology, strategic HR insight, and personalized service to deliver the right
            people for every role—compliantly and at scale.
          </p>
        </Container>
      </section>

      {/* Talent Acquisition */}
      <section className="py-12 md:py-16 bg-slate-50 border-t">
        <Container>
          <div className="rounded-2xl bg-white p-6 md:p-8 border">
            <h2 className="text-2xl font-semibold">Talent Acquisition</h2>
            <p className="mt-2 text-slate-600 max-w-3xl">
              End-to-end hiring solutions designed to match capability, culture, and runway.
            </p>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-5">
                <h3 className="font-medium">Recruitment Process Outsourcing (RPO)</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Plug-in recruiting pods, SLAs, and dashboards to hire consistently across roles and geos.
                </p>
              </div>
              <div className="rounded-xl border p-5">
                <h3 className="font-medium">Executive Search & Head-hunting</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Discreet leadership search with competency mapping, scorecards, and references.
                </p>
              </div>
              <div className="rounded-xl border p-5">
                <h3 className="font-medium">Contract & Permanent Staffing</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Flexible bench and on-demand talent to accelerate delivery without bloating payroll.
                </p>
              </div>
              <div className="rounded-xl border p-5">
                <h3 className="font-medium">Employer Branding & Recruitment Marketing</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Careers site, content, and campaigns that convert qualified applicants.
                </p>
              </div>
            </div>

            <div className="mt-6 text-slate-600">
              <p className="text-sm">
                <span className="font-medium">Our edge:</span> consultative discovery, role scorecards, and a
                hiring playbook aligned to your culture, operating model, and roadmap.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="px-5 py-3 rounded-xl bg-[#172965] text-white hover:opacity-90">
                Request a Consultation
              </Link>
              <Link href="/jobs" className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50">
                View Open Roles
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* EOR */}
      <section className="py-12 md:py-16 bg-white border-t">
        <Container>
          <div className="rounded-2xl bg-white p-6 md:p-8 border">
            <h2 className="text-2xl font-semibold">Employer of Record (EOR)</h2>
            <p className="mt-2 text-slate-600 max-w-3xl">
              Expand seamlessly with confidence. Hire, onboard, and manage talent anywhere—without setting up a
              local entity.
            </p>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-5">
                <h3 className="font-medium">Compliance & Payroll Management</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Contracts, payroll, and statutory filings handled correctly and on time.
                </p>
              </div>
              <div className="rounded-xl border p-5">
                <h3 className="font-medium">Onboarding & HR Administration</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Equipment, benefits, and documentation with employee-friendly workflows.
                </p>
              </div>
              <div className="rounded-xl border p-5">
                <h3 className="font-medium">Statutory Benefits & Tax Management</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Country-specific deductions and benefits managed transparently.
                </p>
              </div>
              <div className="rounded-xl border p-5">
                <h3 className="font-medium">Cross-border Employment & Advisory</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Local nuance on compensation, leave, and compliance—so you can focus on growth.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="px-5 py-3 rounded-xl bg-[#172965] text-white hover:opacity-90">
                Talk to EOR Specialist
              </Link>
              <Link href="/about" className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50">
                Learn About Resourcin
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
