import { Link } from "react-router-dom";
import { formatDistanceToNow } from "../utils/date";
import SeverityBadge from "./SeverityBadge";
import { User, Clock, Wrench, MessageSquare, Microscope, AlertTriangle } from "lucide-react";

const SEVERITY_BORDER = {
  High:   "border-l-red-400",
  Medium: "border-l-amber-400",
  Low:    "border-l-emerald-400",
};

const STALE_DAYS = 7;

function isStale(ticket) {
  if (ticket.status !== "Open" && ticket.status !== "In Progress") return false;
  const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  return new Date(ticket.updated_at).getTime() < cutoff;
}

export default function TicketCard({ ticket, equipmentName, isDragging = false }) {
  const stale = isStale(ticket);

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className={`block bg-white rounded-xl border border-slate-200 border-l-4 p-4
        transition-all duration-150 select-none
        ${SEVERITY_BORDER[ticket.severity] ?? "border-l-slate-300"}
        ${isDragging
          ? "shadow-2xl rotate-1 scale-105 ring-2 ring-blue-400/40 border-blue-300"
          : "shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-l-blue-400"
        }`}
    >
      {/* ID + Part + stale badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
              #{ticket.id}
            </span>
            {stale && (
              <span
                className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600
                  bg-amber-50 ring-1 ring-amber-200 px-1.5 py-0.5 rounded-full"
                title={`No update in ${STALE_DAYS}+ days`}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                Stale
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-snug truncate">
            {ticket.instrument_part}
          </p>
        </div>
        <SeverityBadge severity={ticket.severity} showDot />
      </div>

      {/* Equipment tag — only shown when the caller provides a name */}
      {equipmentName && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-violet-600
            bg-violet-50 ring-1 ring-violet-200 px-2 py-0.5 rounded-full max-w-full truncate">
            <Microscope className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{equipmentName}</span>
          </span>
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {ticket.reporter_name}
        </span>
        {ticket.assigned_to && (
          <span className="flex items-center gap-1 text-blue-500">
            <Wrench className="w-3 h-3" />
            {ticket.assigned_to}
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          {ticket.comment_count > 0 && (
            <span className="flex items-center gap-0.5 mr-2">
              <MessageSquare className="w-3 h-3" />
              {ticket.comment_count}
            </span>
          )}
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(ticket.updated_at)}
        </span>
      </div>
    </Link>
  );
}
