import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getTickets } from "../api/tickets";
import { getEquipmentList } from "../api/equipment";
import KanbanBoard from "../components/KanbanBoard";
import TicketCard from "../components/TicketCard";
import StatsBar from "../components/StatsBar";
import {
  AlertCircle, Columns, List, Loader2, RefreshCw,
  SlidersHorizontal, Microscope,
} from "lucide-react";

const SEVERITY_OPTIONS = ["all", "High", "Medium", "Low"];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets]         = useState([]);
  const [equipment, setEquipment]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [view, setView]               = useState("kanban");
  const [statusFilter, setStatusFilter]       = useState("all");
  const [severityFilter, setSeverityFilter]   = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState(
    searchParams.get("equipment_id") ?? "all"
  );

  // Sync equipment filter from URL param (e.g. from EquipmentDetail link)
  useEffect(() => {
    const id = searchParams.get("equipment_id");
    if (id) setEquipmentFilter(id);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (severityFilter !== "all") params.severity = severityFilter;
      if (equipmentFilter !== "all") params.equipment_id = equipmentFilter;

      const [tRes, eRes] = await Promise.all([
        getTickets(params),
        getEquipmentList(),
      ]);
      setTickets(tRes.data);
      setEquipment(eRes.data);
    } catch {
      setError("Cannot reach the backend. Is it running?");
    } finally {
      setLoading(false);
    }
  }, [severityFilter, equipmentFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const displayed =
    statusFilter === "all"
      ? tickets
      : tickets.filter((t) => t.status === statusFilter);

  const activeEquipment = equipment.filter((e) => e.is_active);
  const selectedEqName  = equipment.find((e) => String(e.id) === equipmentFilter)?.name;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {selectedEqName ? (
              <span className="flex items-center gap-1.5">
                <Microscope className="w-3.5 h-3.5" />
                {selectedEqName} —
              </span>
            ) : null}
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Equipment filter */}
          {activeEquipment.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
              <Microscope className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={equipmentFilter}
                onChange={(e) => {
                  setEquipmentFilter(e.target.value);
                  setStatusFilter("all");
                }}
                className="text-xs text-slate-600 bg-transparent focus:outline-none pr-4 max-w-[160px]"
              >
                <option value="all">All Equipment</option>
                {activeEquipment.map((eq) => (
                  <option key={eq.id} value={String(eq.id)}>{eq.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Severity filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs text-slate-600 bg-transparent focus:outline-none pr-4"
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === "all" ? "All Severity" : s}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
            {[
              { id: "kanban", label: "Kanban", Icon: Columns },
              { id: "list",   label: "List",   Icon: List },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                  ${view === id ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAll}
            title="Refresh"
            className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar
        tickets={tickets}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading tickets…</span>
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard tickets={displayed} onTicketsChange={setTickets} />
      ) : (
        <ListView tickets={displayed} statusFilter={statusFilter} />
      )}
    </div>
  );
}

function ListView({ tickets, statusFilter }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <List className="w-7 h-7" />
        </div>
        <p className="text-sm">
          {statusFilter !== "all" ? `No "${statusFilter}" tickets.` : "No tickets yet."}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {tickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
    </div>
  );
}
