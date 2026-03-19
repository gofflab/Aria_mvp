import { useEffect, useState } from "react";
import { getHistory } from "../api/tickets";
import { getEquipmentList } from "../api/equipment";
import { Link } from "react-router-dom";
import SeverityBadge from "../components/SeverityBadge";
import { formatDate } from "../utils/date";
import { Loader2, AlertCircle, History as HistoryIcon, CheckCircle2, ExternalLink } from "lucide-react";

export default function History() {
  const [tickets, setTickets]     = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    Promise.all([getHistory(), getEquipmentList()])
      .then(([tRes, eRes]) => {
        setTickets(tRes.data);
        setEquipmentMap(Object.fromEntries(eRes.data.map((e) => [e.id, e.name])));
      })
      .catch(() => setError("Failed to load history."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? tickets.filter((t) =>
        [t.instrument_part, t.reporter_name, t.assigned_to,
         t.equipment_id ? equipmentMap[t.equipment_id] : null,
        ].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : tickets;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center">
            <HistoryIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Repair History</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {tickets.length} resolved maintenance event{tickets.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by part, reporter, technician…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm w-72 shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-sm">
            {search ? "No results match your search." : "No resolved tickets yet."}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Ticket", "Equipment", "Subsystem", "Severity", "Reporter", "Resolved By", "Resolved At"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr
                  key={t.id}
                  className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}
                >
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/tickets/${t.id}`}
                      className="flex items-center gap-1.5 text-blue-600 font-semibold hover:text-blue-800 group"
                    >
                      #{t.id}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {t.equipment_id ? (
                      <Link to={`/equipment/${t.equipment_id}`}
                        className="text-violet-600 hover:text-violet-800 hover:underline font-medium">
                        {equipmentMap[t.equipment_id] ?? `#${t.equipment_id}`}
                      </Link>
                    ) : (
                      <span className="text-slate-300 italic">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-slate-800">{t.instrument_part}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <SeverityBadge severity={t.severity} showDot />
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{t.reporter_name}</td>
                  <td className="px-5 py-3.5">
                    {t.assigned_to ? (
                      <span className="text-slate-700 font-medium">{t.assigned_to}</span>
                    ) : (
                      <span className="text-slate-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(t.resolved_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {tickets.length} resolved tickets
          </div>
        </div>
      )}
    </div>
  );
}
