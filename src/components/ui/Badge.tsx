import { memo } from "react";

function BadgeComponent({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 px-2 sm:px-3 py-2 shadow-sm ${className}`}>
      <div className="text-[8px] sm:text-[10px] uppercase tracking-wide text-blue-600 font-bold mb-1">{label}</div>
      <div className="text-xs font-semibold text-blue-800 truncate" title={value}>{value}</div>
    </div>
  );
}

export const Badge = memo(BadgeComponent);