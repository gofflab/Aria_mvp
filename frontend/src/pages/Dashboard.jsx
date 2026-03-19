import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getTickets } from "../api/tickets";
import { getEquipmentList } from "../api/equipment";
import KanbanBoard from "../components/KanbanBoard";
import TicketCard from "../components/TicketCard";
import StatsBar from "../components/StatsBar";
import {
  AlertCircle, Columns, List, Loader2, RefreshCw,
  SlidersHorizontal, Microscope, Search, X,
} from "lucide-react";

const SEVERITY_OPTIONS = ["all", "High", "Medium", "Low"];

export default function Dashboard() {
  const [searchParams] = useSearchParams();

  const [tickets, setTickets]         = useState([]);
  const [equipment, setEquipment]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [view, setView]               = useState("kanban");
  const [search, setSearch]           = useState("");
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

  // Build id→name map for passing to cards
  const equipmentMap = Object.fromEntries(equipment.map((e) => [e.id, e.name]));
  const activeEquipment = equipment.filter((e) => e.is_active);
  const selectedEqName  = equipment.find((e) => String(e.id) === equipmentFilter)?.name;

  // Client-side text search (instrument_part, reporter, assignee, equipment name)
  const needle = search.trim().toLowerCase();
  const afterSearch = needle
    ? tickets.filter((t) =>
        [
          t.instrument_part,
          t.reporter_name,
          t.assigned_to,
          t.equipment_id ? equipmentMap[t.equipment_id] : null,
        ].some((v) => v?.toLowerCase().includes(needle))
      )
    : tickets;

  const displayed =
    statusFilter === "all"
      ? afterSearch
      : afterSearch.filter((t) => t.status === statusFilter);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {selectedEqName
              ? `${selectedEqName} — `
              : ""}
            {displayed.length} ticket{displayed.length !== 1 ? "s" : ""}
            {needle && ` matching "${search}"`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Text search */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets…"
              className="flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400 min-w-0"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

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
        tickets={afterSearch}
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
        <KanbanBoard
          tickets={displayed}
          onTicketsChange={setTickets}
          equipmentMap={equipmentFilter === "all" ? equipmentMap : {}}
        />
      ) : (
        <ListView
          tickets={displayed}
          statusFilter={statusFilter}
          equipmentMap={equipmentFilter === "all" ? equipmentMap : {}}
        />
      )}
    </div>
  );
}

function ListView({ tickets, statusFilter, equipmentMap }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <List className="w-7 h-7" />
        </div>
        <p className="text-sm">
          {statusFilter !== "all" ? `No "${statusFilter}" tickets.` : "No tickets match."}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {tickets.map((t) => (
        <TicketCard
          key={t.id}
          ticket={t}
          equipmentName={t.equipment_id ? equipmentMap[t.equipment_id] : undefined}
        />
      ))}
    </div>
  );
}
