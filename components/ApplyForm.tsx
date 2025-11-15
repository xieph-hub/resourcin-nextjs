// components/ApplyForm.tsx
"use client";

import { useState } from "react";

type ApplyFormProps = {
  jobTitle: string;
  jobSlug: string;
};

export default function ApplyForm({ jobTitle, jobSlug }: ApplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setIsError(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Make sure these are present regardless of the DOM
    formData.set("jobSlug", jobSlug);
    formData.set("jobTitle", jobTitle);

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      });

      const raw = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(raw);
      } catch {
        console.error("Non-JSON /api/apply response:", raw);
      }

      const ok = res.ok && data?.ok;

      if (!ok) {
        setIsError(true);
        setMessage(
          data?.message ||
            raw ||
            "We couldn’t submit your application. Please try again or email us directly."
        );
        return;
      }

      if (data?.uploadError) {
        setIsError(false);
        setMessage(
          `Your application has been received, but your CV upload failed: ${data.uploadError}. Please email your CV to hello@resourcin.com with the role title in the subject.`
        );
      } else {
        setIsError(false);
        setMessage("Thank you — your application has been received.");
      }

      // Reset the form fields
      form.reset();
    } catch (err) {
      console.error("Apply error:", err);
      setIsError(true);
      setMessage(
        "Something went wrong while submitting your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        Apply for this role
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Submit your details and we&apos;ll review your application. You can also
        email{" "}
        <a
          href={`mailto:hello@resourcin.com?subject=${encodeURIComponent(
            `Application: ${jobTitle}`
          )}`}
          className="text-[#172965] underline"
        >
          hello@resourcin.com
        </a>{" "}
        if you prefer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden job identifiers */}
        <input type="hidden" name="jobSlug" value={jobSlug} />
        <input type="hidden" name="jobTitle" value={jobTitle} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Full name *
            </label>
            <input
              required
              name="name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
              placeholder="Jane Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Email address *
            </label>
            <input
              required
              type="email"
              name="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
              placeholder="jane@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Phone number
            </label>
            <input
              name="phone"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
              placeholder="+234..."
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Location
            </label>
            <input
              name="location"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
              placeholder="Lagos, Nigeria"
            />
          </div>
        </div>

        {/* CV / Resume file upload */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            CV / Resume file
          </label>
          <input
            name="resume"
            type="file"
            accept=".pdf,.doc,.docx,.rtf,.txt"
            className="block w-full text-xs text-slate-500
                       file:mr-3 file:rounded-full file:border-0
                       file:bg-[#172965] file:px-4 file:py-2
                       file:text-xs file:font-semibold file:text-white
                       hover:file:bg-[#101c44]"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            If upload fails, your application will still go through and you can
            email your CV separately.
          </p>
        </div>

        {/* Button + message */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-[#172965] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#101c44] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit application"}
          </button>

          {message && (
            <p
              className={`text-xs ${
                isError ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
