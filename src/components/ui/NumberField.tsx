
export function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="group block text-sm mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="tabular-nums font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg text-sm">{value}</span>
      </div>
      <input 
        type="number" 
        value={value} 
        min={min} 
        max={max} 
        onChange={(e) => onChange(parseInt(e.target.value || "0"))} 
        className="w-full rounded-xl border-2 border-green-200 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/80 transition-all duration-200 hover:border-green-300 touch-manipulation" 
      />
    </label>
  );
}