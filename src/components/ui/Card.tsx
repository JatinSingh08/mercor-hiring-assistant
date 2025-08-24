export function Card({ title, children, icon, className = "" }: { title: string; children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-100 flex items-center gap-2">
        {icon}
        <h2 className="font-semibold text-sm sm:text-base">{title}</h2>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}