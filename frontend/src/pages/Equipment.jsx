import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEquipmentList } from "../api/equipment";
import {
  Microscope, PlusCircle, MapPin, Building2, Hash,
  AlertCircle, Loader2, CheckCircle, XCircle, Ticket,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  active:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-slate-100 text-slate-500 ring-slate-200",
};

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    getEquipmentList()
      .then((r) => setEquipment(r.data))
      .catch(() => setError("Could not load equipment list."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 ring-1 ring-violet-200 flex items-center justify-center">
            <Microscope className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Equipment Registry</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {equipment.length} instrument{equipment.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>
        <Link
          to="/equipment/new"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white
            text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Equipment
        </Link>
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

      {!loading && equipment.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Microscope className="w-7 h-7" />
          </div>
          <p className="text-sm text-center">
            No equipment registered yet.{" "}
            <Link to="/equipment/new" className="text-blue-500 hover:underline">
              Add your first instrument
            </Link>
          </p>
        </div>
      )}

      {/* Equipment grid */}
      {!loading && equipment.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {equipment.map((eq) => (
            <EquipmentCard key={eq.id} eq={eq} />
          ))}
        </div>
      )}
    </div>
  );
}

function EquipmentCard({ eq }) {
  const isActive = eq.is_active;
  return (
    <Link
      to={`/equipment/${eq.id}`}
      className={`group block bg-white rounded-2xl border shadow-sm p-5 transition-all
        hover:shadow-md hover:-translate-y-0.5
        ${isActive ? "border-slate-200 hover:border-blue-300" : "border-slate-200 opacity-70"}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600
          flex items-center justify-center shadow-sm shrink-0">
          <Microscope className="w-5 h-5 text-white" />
        </div>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ring-1 ${
          isActive ? STATUS_BADGE.active : STATUS_BADGE.inactive
        }`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Name & manufacturer */}
      <h2 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-700 transition-colors">
        {eq.name}
      </h2>
      {eq.manufacturer && (
        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
          <Building2 className="w-3 h-3" /> {eq.manufacturer}
        </p>
      )}

      {/* Details */}
      <div className="mt-3 space-y-1 text-xs text-slate-500">
        {eq.model_number && (
          <div className="flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-slate-400" />
            {eq.model_number}
          </div>
        )}
        {eq.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            {eq.location}
          </div>
        )}
      </div>

      {/* Ticket counts */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-slate-500">
          <Ticket className="w-3.5 h-3.5" />
          {eq.total_ticket_count} ticket{eq.total_ticket_count !== 1 ? "s" : ""}
        </span>
        {eq.open_ticket_count > 0 && (
          <span className="flex items-center gap-1 text-amber-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {eq.open_ticket_count} open
          </span>
        )}
        {eq.open_ticket_count === 0 && eq.total_ticket_count > 0 && (
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            All clear
          </span>
        )}
        <span className="ml-auto text-slate-300 text-xs">
          {eq.subsystems?.length ?? 0} subsystems
        </span>
      </div>
    </Link>
  );
}
