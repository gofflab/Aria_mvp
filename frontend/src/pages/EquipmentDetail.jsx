import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getEquipment, updateEquipment, deleteEquipment,
  addSubsystem, updateSubsystem, deleteSubsystem,
} from "../api/equipment";
import { getTickets } from "../api/tickets";
import TicketCard from "../components/TicketCard";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowLeft, Loader2, Save, Trash2, Plus, Pencil, Check, X,
  MapPin, Building2, Hash, BarChart2, Tag, ChevronRight,
  ToggleLeft, ToggleRight, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

// ── inline-editable field ────────────────────────────────────────────────────
function EditableField({ label, value, onSave, multiline = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  const commit = async () => {
    await onSave(draft);
    setEditing(false);
  };
  const cancel = () => { setDraft(value ?? ""); setEditing(false); };

  if (editing) {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
        {multiline ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="w-full bg-slate-50 border border-blue-300 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full bg-slate-50 border border-blue-300 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}
        <div className="flex gap-2">
          <button onClick={commit} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            <Check className="w-3.5 h-3.5" /> Save
          </button>
          <button onClick={cancel} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer space-y-0.5"
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer">
        {label}
      </label>
      <div className="flex items-center gap-1.5 text-sm text-slate-700">
        <span className={value ? "" : "text-slate-400 italic"}>{value || "—"}</span>
        <Pencil className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

// ── subsystem row ─────────────────────────────────────────────────────────────
function SubsystemRow({ sub, eqId, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(sub.name);
  const [desc, setDesc] = useState(sub.description ?? "");

  const save = async () => {
    try {
      await updateSubsystem(eqId, sub.id, { name, description: desc || null });
      onSaved();
      setEditing(false);
      toast.success("Subsystem updated.");
    } catch { toast.error("Failed to update subsystem."); }
  };

  const del = async () => {
    try {
      await deleteSubsystem(eqId, sub.id);
      onDeleted();
      toast.success("Subsystem removed.");
    } catch { toast.error("Failed to remove subsystem."); }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2 border border-blue-200">
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <button onClick={save} className="text-emerald-600 hover:text-emerald-700"><Check className="w-4 h-4" /></button>
        <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-2 py-2 rounded-lg group hover:bg-slate-50 transition-colors">
      <Tag className="w-3.5 h-3.5 text-violet-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-slate-700">{sub.name}</span>
        {sub.description && (
          <p className="text-xs text-slate-400 truncate">{sub.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="p-1 text-slate-400 hover:text-blue-500">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={del} className="p-1 text-slate-400 hover:text-red-500">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eq, setEq] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubName, setNewSubName] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");
  const [addingSubsystem, setAddingSubsystem] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);

  const load = async () => {
    try {
      const [eqRes, tRes] = await Promise.all([
        getEquipment(id),
        getTickets({ equipment_id: id }),
      ]);
      setEq(eqRes.data);
      setTickets(tRes.data);
    } catch {
      toast.error("Equipment not found.");
      navigate("/equipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const patch = async (field, value) => {
    try {
      const res = await updateEquipment(id, { [field]: value });
      setEq(res.data);
      toast.success("Saved.");
    } catch { toast.error("Failed to save."); }
  };

  const toggleActive = async () => patch("is_active", !eq.is_active);

  const handleDelete = async () => {
    if (!confirm(`Permanently delete "${eq.name}"? Tickets will be retained but unlinked.`)) return;
    try {
      await deleteEquipment(id);
      toast.success("Equipment deleted.");
      navigate("/equipment");
    } catch { toast.error("Failed to delete equipment."); }
  };

  const handleAddSubsystem = async (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    setAddingSubsystem(true);
    try {
      await addSubsystem(id, {
        name: newSubName,
        description: newSubDesc || null,
        sort_order: eq.subsystems.length,
      });
      setNewSubName("");
      setNewSubDesc("");
      setShowAddSub(false);
      toast.success("Subsystem added.");
      await load();
    } catch { toast.error("Failed to add subsystem."); }
    finally { setAddingSubsystem(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
  if (!eq) return null;

  const openTickets   = tickets.filter((t) => t.status === "Open" || t.status === "In Progress");
  const closedTickets = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed");

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <button onClick={() => navigate("/equipment")} className="hover:text-slate-800 transition-colors">
          Equipment
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-medium">{eq.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Info + Subsystems ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Info card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-blue-600" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600
                  flex items-center justify-center shadow-sm shrink-0">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <button
                  onClick={toggleActive}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 transition-colors
                    ${eq.is_active
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 ring-slate-200 hover:bg-slate-200"
                    }`}
                  title="Toggle active status"
                >
                  {eq.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  {eq.is_active ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="space-y-4">
                <EditableField label="Name" value={eq.name} onSave={(v) => patch("name", v)} />
                <EditableField label="Manufacturer" value={eq.manufacturer} onSave={(v) => patch("manufacturer", v)} />
                <EditableField label="Model Number" value={eq.model_number} onSave={(v) => patch("model_number", v)} />
                <EditableField label="Serial Number" value={eq.serial_number} onSave={(v) => patch("serial_number", v)} />
                <EditableField label="Location" value={eq.location} onSave={(v) => patch("location", v)} />
                <EditableField label="Description" value={eq.description} onSave={(v) => patch("description", v)} multiline />
              </div>
            </div>
          </div>

          {/* Subsystems card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700">
                Subsystems
                <span className="ml-2 bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                  {eq.subsystems.length}
                </span>
              </h2>
              <button
                onClick={() => setShowAddSub((s) => !s)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {showAddSub && (
              <form onSubmit={handleAddSubsystem} className="mb-4 bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-200">
                <input
                  autoFocus
                  type="text"
                  placeholder="Subsystem name *"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={addingSubsystem}
                    className="flex items-center gap-1.5 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    {addingSubsystem ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Add
                  </button>
                  <button type="button" onClick={() => setShowAddSub(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {eq.subsystems.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No subsystems defined yet.</p>
            ) : (
              <div className="space-y-0.5">
                {eq.subsystems.map((sub) => (
                  <SubsystemRow
                    key={sub.id}
                    sub={sub}
                    eqId={id}
                    onSaved={load}
                    onDeleted={load}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h2>
            <button onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600
                text-sm px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors font-medium">
              <Trash2 className="w-4 h-4" /> Delete Equipment
            </button>
          </div>
        </div>

        {/* ── Tickets ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/new?equipment_id=${eq.id}`}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white
                text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Ticket for This Equipment
            </Link>
            <Link
              to={`/?equipment_id=${eq.id}`}
              className="flex items-center gap-1.5 border border-slate-200 bg-white text-slate-600
                text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on Dashboard
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Tickets", value: tickets.length, color: "text-slate-700", bg: "bg-slate-50" },
              { label: "Open / In Progress", value: openTickets.length, color: "text-amber-700", bg: "bg-amber-50" },
              { label: "Resolved / Closed", value: closedTickets.length, color: "text-emerald-700", bg: "bg-emerald-50" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 border border-slate-200`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Active tickets */}
          {openTickets.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                Active Issues
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{openTickets.length}</span>
              </h2>
              <div className="flex flex-col gap-2">
                {openTickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
              </div>
            </div>
          )}

          {/* Resolved tickets */}
          {closedTickets.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                Resolved / Closed
                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{closedTickets.length}</span>
              </h2>
              <div className="flex flex-col gap-2">
                {closedTickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
              </div>
            </div>
          )}

          {tickets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400
              bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm">No tickets for this equipment yet.</p>
              <Link to={`/new?equipment_id=${eq.id}`} className="text-blue-500 hover:underline text-sm">
                Create the first ticket
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
