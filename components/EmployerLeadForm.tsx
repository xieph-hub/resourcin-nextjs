"use client";

import { useState } from "react";

type Status = "idle" | "success" | "error";

export default function EmployerLeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("idle");
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      fullName: formData.get("fullName") as string,
      companyName: formData.get("companyName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      roleTitle: formData.get("roleTitle") as string,
      seniority: formData.get("seniority") as string,
      location: formData.get("location") as string,
      headcount: formData.get("headcount") as string,
      service: formData.get("service") as string,
      timeline: formData.get("timeline") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const res = await fetch("/api/employer-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      console.error("Error submitting employer lead", err);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="fullName" className="text-sm font-medium">
            Your name
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            placeholder="e.g. Bunmi Akinyemiju"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="companyName" className="text-sm font-medium">
            Company
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            placeholder="e.g. Venture Garden Group"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            placeholder="you@company.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone / WhatsApp (optional)
          </label>
          <input
            id="phone"
            name="phone"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            placeholder="+234..."
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="roleTitle" className="text-sm font-medium">
            Role you&apos;re hiring for
          </label>
          <input
            id="roleTitle"
            name="roleTitle"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            placeholder="e.g. Country Manager (Kenya)"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="seniority" className="text-sm font-medium">
            Seniority
          </label>
          <select
            id="seniority"
            name="seniority"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            defaultValue="mid"
          >
            <option value="graduate">Graduate / entry-level</option>
            <option value="mid">Mid-level / experienced hire</option>
            <option value="senior">Senior / leadership</option>
            <option value="executive">Executive / C-level</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="location" className="text-sm font-medium">
            Location / geography
          </label>
          <input
            id="location"
            name="location"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            placeholder="e.g. Lagos (hybrid), remote Africa, etc."
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="headcount" className="text-sm font-medium">
            Number of hires
          </label>
          <input
            id="headcount"
            name="headcount"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            placeholder="e.g. 1, 5, 20+"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="service" className="text-sm font-medium">
            Service type
          </label>
          <select
            id="service"
            name="service"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            defaultValue="ta"
          >
            <option value="ta">Talent Acquisition / Recruitment</option>
            <option value="eor">Employer of Record (EOR)</option>
            <option value="rpo">RPO / embedded pod</option>
            <option value="exec">Executive search</option>
            <option value="other">Not sure / other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="timeline" className="text-sm font-medium">
            Hiring timeline
          </label>
          <select
            id="timeline"
            name="timeline"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            defaultValue="soon"
          >
            <option value="asap">ASAP (this month)</option>
            <option value="soon">1–3 months</option>
            <option value="later">3–6+ months</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium">
          Anything else we should know?
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          placeholder="Budget, ideal profile, challenges you’d like us to solve..."
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending..." : "Request talent"}
        </button>

        {status === "success" && (
          <p className="text-xs text-emerald-700">
            Got it. We&apos;ll review and get back to you.
          </p>
        )}

        {status === "error" && (
          <p className="text-xs text-red-600">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </form>
  );
}
