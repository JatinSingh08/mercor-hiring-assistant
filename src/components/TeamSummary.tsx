import { memo } from "react";

function TeamSummaryComponent({ summary, size }: { summary: { skills: string[]; locations: string[]; cost: number }; size: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 shadow-md">
        <div className="text-[10px] uppercase tracking-wide text-blue-600 font-bold mb-1">Team Size</div>
        <div className="text-xl sm:text-2xl font-bold text-blue-700">{size}</div>
      </div>
      <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 shadow-md">
        <div className="text-[10px] uppercase tracking-wide text-purple-600 font-bold mb-1">Locations</div>
        <div className="text-xs sm:text-sm font-medium text-purple-700">{summary.locations.join(", ") || "—"}</div>
      </div>
      <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 shadow-md">
        <div className="text-[10px] uppercase tracking-wide text-emerald-600 font-bold mb-1">Total Cost</div>
        <div className="text-xl sm:text-2xl font-bold text-emerald-700">${summary.cost.toLocaleString()}</div>
      </div>
    </div>
  );
}

export const TeamSummary = memo(TeamSummaryComponent);