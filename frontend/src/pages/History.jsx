import { useEffect, useState } from "react";
import { getHistory } from "../api/tickets";
import { Link } from "react-router-dom";
import SeverityBadge from "../components/SeverityBadge";
import { formatDate } from "../utils/date";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function History() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHistory()
      .then((res) => setTickets(res.data))
      .catch(() => setError("Failed to load history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Repair History</h1>
          <p className="text-slate-500 text-sm">All resolved maintenance events on the BD FACS Aria III.</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded p-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <p className="text-slate-400 text-center py-16">No resolved tickets yet.</p>
      )}

      {!loading && tickets.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subsystem</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reporter</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${t.id}`} className="text-blue-600 font-medium hover:underline">
                      #{t.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{t.instrument_part}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={t.severity} /></td>
                  <td className="px-4 py-3 text-slate-600">{t.reporter_name}</td>
                  <td className="px-4 py-3 text-slate-600">{t.assigned_to ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(t.resolved_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
