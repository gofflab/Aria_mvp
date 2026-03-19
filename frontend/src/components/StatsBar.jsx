import { AlertCircle, Clock, CheckCircle, Archive } from "lucide-react";

const STATS = [
  {
    key: "Open",
    label: "Open",
    icon: AlertCircle,
    color: "text-sky-600",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
  },
  {
    key: "In Progress",
    label: "In Progress",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
  },
  {
    key: "Resolved",
    label: "Resolved",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
  },
  {
    key: "Closed",
    label: "Closed",
    icon: Archive,
    color: "text-slate-500",
    bg: "bg-slate-100",
    ring: "ring-slate-200",
  },
];

export default function StatsBar({ tickets, activeFilter, onFilterChange }) {
  const total = tickets.length;
  const counts = Object.fromEntries(STATS.map((s) => [s.key, tickets.filter((t) => t.status === s.key).length]));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {STATS.map(({ key, label, icon: Icon, color, bg, ring }) => {
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            onClick={() => onFilterChange(isActive ? "all" : key)}
            className={`group relative flex items-center gap-3 p-4 rounded-xl border transition-all
              ${isActive
                ? `${bg} ring-2 ${ring} border-transparent shadow-sm`
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} ring-1 ${ring}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-slate-800 leading-none">{counts[key]}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
            {total > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden bg-slate-100">
                <div
                  className={`h-full transition-all ${color.replace("text-", "bg-")}`}
                  style={{ width: `${Math.round((counts[key] / total) * 100)}%` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
