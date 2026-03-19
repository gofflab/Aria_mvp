import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicket, updateTicket, deleteTicket, addComment, deleteComment,
} from "../api/tickets";
import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/date";
import toast from "react-hot-toast";
import {
  ArrowLeft, Loader2, Save, Trash2, MessageSquarePlus, X,
  User, Clock, Wrench, Calendar, ChevronRight,
} from "lucide-react";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];
const SEVERITIES = ["Low", "Medium", "High"];

const STATUS_COLOR = {
  "Open": "bg-sky-500",
  "In Progress": "bg-amber-500",
  "Resolved": "bg-emerald-500",
  "Closed": "bg-slate-400",
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [severity, setSeverity] = useState("");

  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTicket(id);
      setTicket(res.data);
      setStatus(res.data.status);
      setAssignedTo(res.data.assigned_to ?? "");
      setSeverity(res.data.severity);
    } catch {
      toast.error("Ticket not found.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTicket(id, { status, assigned_to: assignedTo || null, severity });
      toast.success("Ticket updated.");
      await load();
    } catch {
      toast.error("Failed to update ticket.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this ticket and all its comments?")) return;
    try {
      await deleteTicket(id);
      toast.success("Ticket deleted.");
      navigate("/");
    } catch {
      toast.error("Failed to delete ticket.");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentBody.trim()) {
      toast.error("Name and comment text are both required.");
      return;
    }
    setAddingComment(true);
    try {
      await addComment(id, { author: commentAuthor, body: commentBody });
      setCommentBody("");
      toast.success("Comment added.");
      await load();
    } catch {
      toast.error("Failed to add comment.");
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId);
      toast.success("Comment deleted.");
      await load();
    } catch {
      toast.error("Failed to delete comment.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  if (!ticket) return null;

  const dirty =
    status !== ticket.status ||
    severity !== ticket.severity ||
    (assignedTo || null) !== (ticket.assigned_to ?? null);

  const progressSteps = ["Open", "In Progress", "Resolved", "Closed"];
  const currentStep = progressSteps.indexOf(ticket.status);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <button onClick={() => navigate("/")} className="hover:text-slate-800 transition-colors">
          Dashboard
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-medium">Ticket #{ticket.id}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main panel ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Status bar */}
            <div className={`h-1.5 w-full ${STATUS_COLOR[ticket.status] ?? "bg-slate-300"}`} />
            <div className="p-6">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={ticket.status} />
                    <SeverityBadge severity={ticket.severity} showDot />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 mt-2">
                    {ticket.instrument_part}
                  </h1>
                </div>
              </div>

              {/* Progress tracker */}
              <div className="flex items-center gap-1 mb-5">
                {progressSteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-1 flex-1">
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border-2 transition-all
                        ${i <= currentStep
                          ? `${STATUS_COLOR[ticket.status] ?? "bg-blue-500"} border-transparent text-white`
                          : "bg-white border-slate-200 text-slate-400"
                        }`}
                    >
                      {i + 1}
                    </div>
                    {i < progressSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded ${i < currentStep ? (STATUS_COLOR[ticket.status] ?? "bg-blue-500") : "bg-slate-200"}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 -mt-3 mb-4 px-0">
                {progressSteps.map((step) => (
                  <span key={step} className={`${ticket.status === step ? "text-slate-700 font-semibold" : ""}`}>
                    {step}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { icon: User, label: "Reporter", value: ticket.reporter_name },
                  { icon: Wrench, label: "Assigned To", value: ticket.assigned_to ?? "Unassigned" },
                  { icon: Calendar, label: "Created", value: formatDate(ticket.created_at) },
                  { icon: Clock, label: "Updated", value: formatDate(ticket.updated_at) },
                  ticket.resolved_at && { icon: Clock, label: "Resolved", value: formatDate(ticket.resolved_at) },
                ].filter(Boolean).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                      <Icon className="w-3 h-3" />
                      <span className="uppercase tracking-wider text-[9px] font-semibold">{label}</span>
                    </div>
                    <span className="text-slate-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Problem description */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Problem Description</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
              {ticket.problem_description}
            </p>
          </div>

          {/* Comments / Service log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-blue-500" />
              Service Log
              <span className="ml-auto bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                {ticket.comments.length}
              </span>
            </h2>

            {/* Comment thread */}
            <div className="flex flex-col gap-3 mb-6">
              {ticket.comments.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-6">
                  No service notes yet. Add the first one below.
                </p>
              ) : (
                ticket.comments.map((c) => (
                  <div key={c.id} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                      {c.author[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800">{c.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                            title="Delete comment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add comment */}
            <form onSubmit={handleAddComment} className="border-t border-slate-100 pt-5">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  +
                </div>
                <div className="flex-1 space-y-2.5">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-slate-400"
                  />
                  <textarea
                    placeholder="Add a service note, finding, or update…"
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-y placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={addingComment}
                    className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg
                      hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
                  >
                    {addingComment
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <MessageSquarePlus className="w-3.5 h-3.5" />
                    }
                    Add Note
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Management card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Manage</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                <div className="flex flex-col gap-1.5">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                        ${status === s
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${status === s ? "bg-white" : STATUS_COLOR[s]}`} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
                >
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                  Assigned Technician
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Unassigned"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                  text-white text-sm px-4 py-2.5 rounded-lg font-medium
                  disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {dirty ? "Save Changes" : "Up to date"}
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h2>
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 text-sm
                px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
