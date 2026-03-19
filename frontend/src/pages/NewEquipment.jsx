import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createEquipment } from "../api/equipment";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical, Save } from "lucide-react";

function SubsystemRow({ sub, onChange, onDelete }) {
  return (
    <div className="flex items-center gap-2 group">
      <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
      <input
        type="text"
        value={sub.name}
        onChange={(e) => onChange({ ...sub, name: e.target.value })}
        placeholder="Subsystem name (e.g. Laser — 488nm)"
        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
        required
      />
      <input
        type="text"
        value={sub.description}
        onChange={(e) => onChange({ ...sub, description: e.target.value })}
        placeholder="Short description (optional)"
        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
      />
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function NewEquipment() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    manufacturer: "",
    model_number: "",
    serial_number: "",
    location: "",
    description: "",
  });
  const [subsystems, setSubsystems] = useState([
    { name: "", description: "", sort_order: 0 },
  ]);

  const setField = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const updateSub = (i, updated) =>
    setSubsystems((s) => s.map((x, idx) => (idx === i ? updated : x)));

  const addSub = () =>
    setSubsystems((s) => [...s, { name: "", description: "", sort_order: s.length }]);

  const removeSub = (i) =>
    setSubsystems((s) => s.filter((_, idx) => idx !== i).map((x, idx) => ({ ...x, sort_order: idx })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Equipment name is required."); return; }
    setSubmitting(true);
    try {
      const filteredSubs = subsystems
        .filter((s) => s.name.trim())
        .map((s, i) => ({ ...s, sort_order: i }));
      const res = await createEquipment({ ...form, subsystems: filteredSubs });
      toast.success("Equipment added!");
      navigate(`/equipment/${res.data.id}`);
    } catch {
      toast.error("Failed to add equipment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link to="/equipment" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Equipment
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Register New Equipment</h1>
        <p className="text-slate-500 text-sm mt-1">
          Add a lab instrument to the registry and define its subsystems for ticket reporting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">

        {/* Basic info */}
        <div className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Instrument Details</h2>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Instrument Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={setField("name")}
              placeholder="e.g. BD FACS Aria III"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { field: "manufacturer", label: "Manufacturer", placeholder: "e.g. BD Biosciences" },
              { field: "model_number", label: "Model Number", placeholder: "e.g. FACS Aria III" },
              { field: "serial_number", label: "Serial Number", placeholder: "e.g. SN-ARIA3-00421" },
              { field: "location", label: "Location", placeholder: "e.g. Room 4B, Building 2" },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                <input
                  type="text"
                  value={form[field]}
                  onChange={setField(field)}
                  placeholder={placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={setField("description")}
              rows={3}
              placeholder="Brief description of the instrument and its primary uses…"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Subsystems */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Subsystems</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Define the components users select when filing a ticket for this instrument.
              </p>
            </div>
            <button
              type="button"
              onClick={addSub}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add subsystem
            </button>
          </div>

          <div className="space-y-2">
            {subsystems.map((sub, i) => (
              <SubsystemRow
                key={i}
                sub={sub}
                onChange={(updated) => updateSub(i, updated)}
                onDelete={() => removeSub(i)}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/equipment")}
            className="flex-1 border border-slate-200 bg-white text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
              text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-60 shadow-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Equipment
          </button>
        </div>
      </form>
    </div>
  );
}
