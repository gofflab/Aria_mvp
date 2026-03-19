import { useEffect, useState } from "react";
import { getTickets } from "../api/tickets";
import TicketCard from "../components/TicketCard";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

const STATUS_ICONS = {
  Open: "🔴",
  "In Progress": "🟡",
  Resolved: "🟢",
  Closed: "⚫",
};

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter !== "all") params.status = filter;
      if (severityFilter !== "all") params.severity = severityFilter;
      const res = await getTickets(params);
      setTickets(res.data);
    } catch {
      setError("Failed to load tickets. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filter, severityFilter]);

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = tickets.filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maintenance Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">BD FACS Aria III — Issue Tracker</p>
        </div>
        <button
          onClick={fetchTickets}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 bg-white border border-slate-200 rounded p-1">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors
                ${filter === s ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded p-1">
          {["all", "High", "Medium", "Low"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors
                ${severityFilter === s ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {s === "all" ? "Any Severity" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {STATUSES.map((s) => (
          <div
            key={s}
            className="bg-white border border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => setFilter(s)}
          >
            <div className="text-2xl mb-1">{STATUS_ICONS[s]}</div>
            <div className="text-xl font-bold text-slate-800">{grouped[s].length}</div>
            <div className="text-xs text-slate-500">{s}</div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded p-4 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Ticket columns */}
      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filter !== "all" ? (
        <div className="flex flex-col gap-3">
          {tickets.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No tickets found.</p>
          ) : (
            tickets.map((t) => <TicketCard key={t.id} ticket={t} />)
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUSES.map((s) => (
            <div key={s}>
              <h2 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                {STATUS_ICONS[s]} {s}
                <span className="ml-auto bg-slate-200 text-slate-600 text-xs px-1.5 py-0.5 rounded">
                  {grouped[s].length}
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {grouped[s].length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 bg-white rounded border border-dashed border-slate-200">
                    No tickets
                  </p>
                ) : (
                  grouped[s].map((t) => <TicketCard key={t.id} ticket={t} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
