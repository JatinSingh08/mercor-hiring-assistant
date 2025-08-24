

export function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
        <span className="font-medium text-gray-700 text-sm">{label}</span>
        <span className="tabular-nums font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">{value.toFixed(2)}</span>
      </div>
      <input 
        type="range" 
        min={0} 
        max={1} 
        step={0.01} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
        className="w-full h-3 sm:h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer touch-manipulation" 
      />
    </div>
  );
}