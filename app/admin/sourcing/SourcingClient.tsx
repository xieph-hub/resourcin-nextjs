"use client";

import { useState } from "react";

type CandidateSummary = {
  id: string;
  fullname: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  source: string | null;
  createdAt: string;
};

type Props = {
  initialCandidates: CandidateSummary[];
};

export default function SourcingClient({ initialCandidates }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("LinkedIn");
  const [resumeUrl, setResumeUrl] = useState("");
  const [profileText, setProfileText] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState(false);

  const [candidates, setCandidates] =
    useState<CandidateSummary[]>(initialCandidates);

  async function handleAiFill() {
    if (!profileText.trim()) {
      setAiError("Please paste a LinkedIn profile or CV text first.");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: profileText }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setAiError(
          data?.message ||
            "AI could not parse this profile. Try a different paste or fill manually."
        );
        return;
      }

      const parsed = data.data || {};

      if (parsed.fullName) setFullName(parsed.fullName);
      if (parsed.email) setEmail(parsed.email);
      if (parsed.phone) setPhone(parsed.phone);
      if (parsed.location) setLocation(parsed.location);
      if (parsed.source) setSource(parsed.source);

      setAiError(null);
    } catch (error) {
      console.error("AI parse error:", error);
      setAiError(
        "Something went wrong while calling AI. Please try again or fill fields manually."
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(false);
    setSubmitMessage(null);

    try {
      const res = await fetch("/api/sourcing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          location,
          source,
          resumeUrl,
          rawText: profileText,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setSubmitError(true);
        setSubmitMessage(
          data?.message || "Could not save candidate. Please try again."
        );
        return;
      }

      const c = data.candidate as CandidateSummary;
      setCandidates((prev) => [c, ...prev]);

      setSubmitError(false);
      setSubmitMessage("Candidate saved to your sourcing pool.");

      // You can clear everything, but it's often useful to keep the text:
      // Here we reset the key fields but keep the profile text for reference.
      setFullName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setResumeUrl("");
      setSource("LinkedIn");
      // profileText stays, so you can re-use or tweak it if needed
    } catch (error) {
      console.error("Submit candidate error:", error);
      setSubmitError(true);
      setSubmitMessage("Something went wrong while saving candidate.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* LEFT: AI + form */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Add sourced candidate
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Paste a LinkedIn profile, portfolio or CV. Let AI pre-fill the form,
          then review and save.
        </p>

        {/* AI text area */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-slate-600 mb-1">
            Pasted profile / CV text
          </label>
          <textarea
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            className="w-full min-h-[120px] rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
            placeholder="Paste the candidate's LinkedIn profile, CV text or summary here..."
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAiFill}
              disabled={aiLoading || !profileText.trim()}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {aiLoading ? "Letting AI think..." : "AI auto-fill from text"}
            </button>
            {aiError && (
              <p className="text-[11px] text-red-600 text-right flex-1">
                {aiError}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full name */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Full name *
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
                placeholder="Jane Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Email *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
                placeholder="jane@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
                placeholder="+234..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
                placeholder="Lagos, Nigeria"
              />
            </div>
          </div>

          {/* Source + resume URL */}
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr] gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Source
              </label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
                placeholder="LinkedIn, Referral, Talent pool..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                CV / resume URL (optional)
              </label>
              <input
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
                placeholder="Link to CV (Drive, Dropbox, etc.)"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex items-center justify-center rounded-full bg-[#172965] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#101c44] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitLoading ? "Saving candidate..." : "Save to sourcing pool"}
            </button>

            {submitMessage && (
              <p
                className={`text-xs ${
                  submitError ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {submitMessage}
              </p>
            )}
          </div>
        </form>
      </section>

      {/* RIGHT: recent candidates */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Recently sourced candidates
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
            {candidates.length} total
          </span>
        </div>

        {candidates.length === 0 ? (
          <p className="text-xs text-slate-500">
            No candidates in your sourcing pool yet. Add one from the left panel.
          </p>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {candidates.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-slate-900">
                    {c.fullname}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 truncate">
                  {c.email || "No email"}{" "}
                  {c.phone ? `· ${c.phone}` : undefined}
                </div>
                <div className="text-[11px] text-slate-400">
                  {c.location || "Location unknown"}
                  {c.source ? ` · ${c.source}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
