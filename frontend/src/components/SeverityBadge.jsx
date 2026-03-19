const CONFIG = {
  High:   { dot: "bg-red-500",    pill: "bg-red-50 text-red-700 ring-red-200" },
  Medium: { dot: "bg-amber-500",  pill: "bg-amber-50 text-amber-700 ring-amber-200" },
  Low:    { dot: "bg-emerald-500",pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};

export default function SeverityBadge({ severity, showDot = false }) {
  const c = CONFIG[severity] ?? { dot: "bg-slate-400", pill: "bg-slate-100 text-slate-600 ring-slate-200" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${c.pill}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
      {severity}
    </span>
  );
}
