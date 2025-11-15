// components/ApplicationStageSelect.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const STAGES = [
  { value: "APPLIED", label: "Applied" },
  { value: "SCREENING", label: "Screening" },
  { value: "HM", label: "Hiring Manager" },
  { value: "PANEL", label: "Panel" },
  { value: "OFFER", label: "Offer" },
  { value: "HIRED", label: "Hired" },
];

type Props = {
  applicationId: string;
  initialStage: string;
};

export default function ApplicationStageSelect({
  applicationId,
  initialStage,
}: Props) {
  const [stage, setStage] = useState(initialStage || "APPLIED");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStage = e.target.value;
    setStage(newStage);
    setError(null);

    try {
      const res = await fetch("/api/application-stage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          stage: newStage,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data?.message || "Could not update stage. Please try again."
        );
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error(err);
      setError("Network error while updating stage.");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={stage}
        onChange={handleChange}
        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
      >
        {STAGES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {isPending && (
        <span className="text-[10px] text-slate-400">Updating…</span>
      )}
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  );
}
