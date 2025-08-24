import { useEffect, useState } from "react";
export function CurrencyField({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  const [text, setText] = useState<string>(value != null ? String(value) : "");
  useEffect(() => { setText(value != null ? String(value) : ""); }, [value]);
  return (
    <label className="group block text-sm mb-4">
      <div className="mb-2 font-medium text-gray-700">{label}</div>
      <input
        placeholder="e.g., 500000"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value.replace(/[^\d.]/g, ""));
          onChange(e.target.value.trim() === "" || Number.isNaN(n) ? null : n);
        }}
        className="w-full rounded-xl border-2 border-orange-200 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 transition-all duration-200 hover:border-orange-300 touch-manipulation"
      />
    </label>
  );
}