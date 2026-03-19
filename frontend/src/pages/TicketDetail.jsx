import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicket, updateTicket, deleteTicket, addComment, deleteComment
} from "../api/tickets";
import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/date";
import toast from "react-hot-toast";
import {
  ArrowLeft, Loader2, Save, Trash2, MessageSquarePlus, X, User, Clock, Wrench
} from "lucide-react";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [severity, setSeverity] = useState("");

  // New comment
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
      await updateTicket(id, {
        status,
        assigned_to: assignedTo || null,
        severity,
      });
      toast.success("Ticket updated.");
      await load();
    } catch {
      toast.error("Failed to update ticket.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this ticket permanently?")) return;
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
      toast.error("Author and comment body are required.");
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
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!ticket) return null;

  const dirty =
    status !== ticket.status ||
    severity !== ticket.severity ||
    (assignedTo || null) !== (ticket.assigned_to ?? null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main detail panel */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold text-slate-800">
                #{ticket.id} — {ticket.instrument_part}
              </h1>
              <div className="flex gap-1.5 shrink-0">
                <SeverityBadge severity={ticket.severity} />
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ticket.reporter_name}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created: {formatDate(ticket.created_at)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated: {formatDate(ticket.updated_at)}</span>
              {ticket.resolved_at && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Clock className="w-3 h-3" /> Resolved: {formatDate(ticket.resolved_at)}
                </span>
              )}
            </div>

            <h2 className="text-sm font-semibold text-slate-600 mb-1">Problem Description</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded p-3 border border-slate-200">
              {ticket.problem_description}
            </p>
          </div>

          {/* Comments */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4" />
              Service Notes & Comments ({ticket.comments.length})
            </h2>

            {ticket.comments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No comments yet.</p>
            ) : (
              <div className="space-y-3 mb-5">
                {ticket.comments.map((c) => (
                  <div key={c.id} className="flex gap-3 group">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {c.author[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded p-3 border border-slate-200 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-700">{c.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 whitespace-pre-wrap">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="space-y-2 border-t border-slate-100 pt-4">
              <input
                type="text"
                placeholder="Your name"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <textarea
                placeholder="Add a note or update about this issue…"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
              />
              <button
                type="submit"
                disabled={addingComment}
                className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {addingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquarePlus className="w-3.5 h-3.5" />}
                Add Comment
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar — management */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Manage Ticket</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {["Low", "Medium", "High"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <Wrench className="w-3 h-3" /> Assigned To
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Technician name"
                  className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="w-full flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>

          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-1.5 border border-red-200 text-red-600 text-sm px-4 py-2 rounded hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
