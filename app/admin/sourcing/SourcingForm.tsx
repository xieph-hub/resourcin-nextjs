// app/admin/sourcing/SourcingForm.tsx
"use client";

import { useState, useTransition, FormEvent } from "react";

type JobOption = {
  id: string;
  title: string;
};

type CreateSourcedCandidateAction = (
  formData: FormData
) => Promise<{ success: boolean; error?: string } | undefined>;

type SourcingFormProps = {
  jobs: JobOption[];
  createSourcedCandidate: CreateSourcedCandidateAction;
};

// --- simple “AI-ish” parser helpers --- //

function extractEmail(text: string): string | null {
  const match = text.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );
  return match ? match[0] : null;
}

function guessName(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    // Skip obvious non-name lines
    if (
      line.toLowerCase().includes("linkedin.com") ||
      line.toLowerCase().includes("www.") ||
      line.includes("@") ||
      line.length > 80
    ) {
      continue;
    }
    // Heuristic: 2–5 words, each starting uppercase
    const parts = line.split(/\s+/);
    if (parts.length >= 2 && parts.length <= 5) {
      const looksLikeName = parts.every((p) =>
        /^[A-ZÀ-Ý][a-zà-ÿ'.-]+$/.test(p)
      );
      if (looksLikeName) return line;
    }
  }

  return lines[0] || null;
}

function guessLocation(text: string): string | null {
  // Very simple heuristic: look for a line containing a comma and not an email/URL
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (
      line.includes(",") &&
      !line.includes("@") &&
      !line.toLowerCase().includes("linkedin.com") &&
      !line.toLowerCase().includes("www.")
    ) {
      return line;
    }
  }
  return null;
}

export default function SourcingForm({
  jobs,
  createSourcedCandidate,
}: SourcingFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("linkedin");
  const [jobId, setJobId] = useState("");
  const [rawProfile, setRawProfile] = useState("");

  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleAutoFill = () => {
    if (!rawProfile.trim()) {
      setParseError("Paste a LinkedIn profile, CV or summary first.");
      return;
    }

    setParseError(null);
    setIsParsing(true);

    const emailGuess = extractEmail(rawProfile);
    const nameGuess = guessName(rawProfile);
    const locationGuess = guessLocation(rawProfile);

    if (nameGuess && !fullName) setFullName(nameGuess);
    if (emailGuess && !email) setEmail(emailGuess);
    if (locationGuess && !location) setLocation(locationGuess);

    setIsParsing(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setServerMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await createSourcedCandidate(formData);

        if (!result?.success) {
          setServerError(result?.error || "Failed to save candidate.");
          return;
        }

        setServerMessage("Candidate saved into your sourcing pipeline.");

        // Reset form (keep rawProfile optional if you like)
        setFullName("");
        setEmail("");
        setPhone("");
        setLocation("");
        setSource("linkedin");
        setJobId("");
        setRawProfile("");
      } catch (err) {
        console.error("createSourcedCandidate failed", err);
        setServerError("Something went wrong while saving candidate.");
      }
    });
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Left: pasted profile + AI button */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-100">
              1. Paste profile / CV
            </h2>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
              Sourcing
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Paste a LinkedIn “About” section, CV summary, or any raw text. We’ll
            try to infer name, email, and location.
          </p>

          <textarea
            name="rawProfile"
            value={rawProfile}
            onChange={(e) => setRawProfile(e.target.value)}
            rows={10}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#172965] focus:ring-2 focus:ring-[#172965]"
            placeholder="e.g. LinkedIn summary, CV snippet, or notes about the candidate..."
          />

          <button
            type="button"
            onClick={handleAutoFill}
            disabled={isParsing || !rawProfile.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-1.5 text-[11px] font-medium text-slate-50 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-xs">✨</span>
            {isParsing ? "Analyzing..." : "Auto-fill from pasted profile"}
          </button>

          {parseError && (
            <p className="mt-1 text-[11px] text-amber-400">{parseError}</p>
          )}
        </div>

        {/* Right: structured candidate fields */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4"
        >
          <h2 className="text-sm font-semibold text-slate-100">
            2. Review & save candidate
          </h2>

          <div className="space-y-3">
            {/* Full name */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Full name *
              </label>
              <input
                required
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#172965] focus:ring-2 focus:ring-[#172965]"
                placeholder="Jane Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Email address *
              </label>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#172965] focus:ring-2 focus:ring-[#172965]"
                placeholder="jane@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Phone
              </label>
              <input
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#172965] focus:ring-2 focus:ring-[#172965]"
                placeholder="+234..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Location
              </label>
              <input
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#172965] focus:ring-2 focus:ring-[#172965]"
                placeholder="Lagos, Nigeria"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Source
              </label>
              <select
                name="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#172965] focus:ring-2 focus:ring-[#172965]"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="referral">Referral</option>
                <option value="inbound">Inbound CV</option>
                <option value="manual">Manual sourcing</option>
              </select>
            </div>

            {/* Link to job (optional) */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Attach to job (optional)
              </label>
              <select
                name="jobId"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#172965] focus:ring-2 focus:ring-[#172965]"
              >
                <option value="">No specific job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit + messages */}
          <div className="pt-1 space-y-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-full bg-[#172965] px-5 py-2 text-xs font-medium text-white hover:bg-[#101c44] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Saving candidate..." : "Save candidate"}
            </button>

            {serverMessage && (
              <p className="text-[11px] text-emerald-400">{serverMessage}</p>
            )}
            {serverError && (
              <p className="text-[11px] text-red-400">{serverError}</p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
