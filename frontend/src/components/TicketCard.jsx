import { Link } from "react-router-dom";
import { formatDistanceToNow } from "../utils/date";
import SeverityBadge from "./SeverityBadge";
import { User, Clock, Wrench, MessageSquare } from "lucide-react";

const SEVERITY_BORDER = {
  High:   "border-l-red-400",
  Medium: "border-l-amber-400",
  Low:    "border-l-emerald-400",
};

export default function TicketCard({ ticket, isDragging = false }) {
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
      {/* ID + Part */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">#{ticket.id}</span>
          <p className="text-sm font-semibold text-slate-800 leading-snug truncate">
            {ticket.instrument_part}
          </p>
        </div>
        <SeverityBadge severity={ticket.severity} showDot />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-2">
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
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(ticket.updated_at)}
        </span>
      </div>
    </Link>
  );
}
