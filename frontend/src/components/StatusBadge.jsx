const CONFIG = {
  "Open":        { dot: "bg-sky-500",     pill: "bg-sky-50 text-sky-700 ring-sky-200" },
  "In Progress": { dot: "bg-amber-500",   pill: "bg-amber-50 text-amber-700 ring-amber-200" },
  "Resolved":    { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  "Closed":      { dot: "bg-slate-400",   pill: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export default function StatusBadge({ status, showDot = true }) {
  const c = CONFIG[status] ?? { dot: "bg-slate-400", pill: "bg-slate-100 text-slate-600 ring-slate-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${c.pill}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />}
      {status}
    </span>
  );
}
