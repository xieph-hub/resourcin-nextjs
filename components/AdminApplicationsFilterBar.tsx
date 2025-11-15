// components/AdminApplicationsFilterBar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

const STAGES = [
  { value: "ALL", label: "All stages" },
  { value: "APPLIED", label: "Applied" },
  { value: "SCREENING", label: "Screening" },
  { value: "HM", label: "Hiring Manager" },
  { value: "PANEL", label: "Panel" },
  { value: "OFFER", label: "Offer" },
  { value: "HIRED", label: "Hired" },
];

type JobOption = {
  id: string;
  title: string;
};

type Props = {
  jobs: JobOption[];
  currentStage?: string;
  currentJobId?: string;
};

export default function AdminApplicationsFilterBar({
  jobs,
  currentStage,
  currentJobId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedStage = currentStage || "ALL";
  const selectedJobId = currentJobId || "ALL";

  function updateQueryParams(next: { stage?: string; jobId?: string }) {
    const params = new URLSearchParams(searchParams?.toString() || "");

    if (!next.stage || next.stage === "ALL") {
      params.delete("stage");
    } else {
      params.set("stage", next.stage);
    }

    if (!next.jobId || next.jobId === "ALL") {
      params.delete("jobId");
    } else {
      params.set("jobId", next.jobId);
    }

    const query = params.toString();
    const path = query ? `/admin/applications?${query}` : "/admin/applications";
    router.push(path);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-600 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="font-medium text-slate-700">Filters</div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Stage filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-500">
            Stage
          </label>
          <select
            value={selectedStage}
            onChange={(e) =>
              updateQueryParams({ stage: e.target.value, jobId: selectedJobId })
            }
            className="w-40 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Job filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-500">
            Job
          </label>
          <select
            value={selectedJobId}
            onChange={(e) =>
              updateQueryParams({ stage: selectedStage, jobId: e.target.value })
            }
            className="w-56 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#172965] focus:border-[#172965]"
          >
            <option value="ALL">All jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
