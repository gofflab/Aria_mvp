import { Link } from "react-router-dom";
import { formatDistanceToNow } from "../utils/date";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";
import { User, Clock, Wrench } from "lucide-react";

export default function TicketCard({ ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-slate-800 text-sm truncate">
          #{ticket.id} — {ticket.instrument_part}
        </span>
        <div className="flex gap-1.5 shrink-0">
          <SeverityBadge severity={ticket.severity} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {ticket.reporter_name}
        </span>
        {ticket.assigned_to && (
          <span className="flex items-center gap-1">
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
