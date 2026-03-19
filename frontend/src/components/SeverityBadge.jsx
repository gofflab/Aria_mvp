const COLORS = {
  High: "bg-red-100 text-red-700 border border-red-300",
  Medium: "bg-amber-100 text-amber-700 border border-amber-300",
  Low: "bg-green-100 text-green-700 border border-green-300",
};

export default function SeverityBadge({ severity }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${COLORS[severity] ?? "bg-slate-100 text-slate-600"}`}>
      {severity}
    </span>
  );
}
