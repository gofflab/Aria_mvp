const COLORS = {
  Open: "bg-blue-100 text-blue-700 border border-blue-300",
  "In Progress": "bg-purple-100 text-purple-700 border border-purple-300",
  Resolved: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Closed: "bg-slate-100 text-slate-600 border border-slate-300",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${COLORS[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
