import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { createTicket } from "../api/tickets";
import { getEquipmentList } from "../api/equipment";
import toast from "react-hot-toast";
import {
  ArrowLeft, Loader2, Send, AlertTriangle, Minus, Info,
  Microscope, ChevronDown,
} from "lucide-react";

const SEVERITY_CONFIG = {
  Low: {
    icon: Info,
    label: "Low",
    desc: "Minor issue, no impact on experiments",
    selected: "ring-2 ring-emerald-400 bg-emerald-50 border-emerald-400",
  },
  Medium: {
    icon: Minus,
    label: "Medium",
    desc: "Degraded performance, workaround exists",
    selected: "ring-2 ring-amber-400 bg-amber-50 border-amber-400",
  },
  High: {
    icon: AlertTriangle,
    label: "High",
    desc: "Instrument down or unsafe to operate",
    selected: "ring-2 ring-red-400 bg-red-50 border-red-400",
  },
};

export default function NewTicket() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [equipment, setEquipment] = useState([]);
  const [loadingEq, setLoadingEq] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const preselectedEqId = searchParams.get("equipment_id");

  const [form, setForm] = useState({
    equipment_id: preselectedEqId ? parseInt(preselectedEqId) : "",
    instrument_part: "",
    problem_description: "",
    severity: "Medium",
    reporter_name: "",
  });

  useEffect(() => {
    getEquipmentList()
      .then((r) => {
        const active = r.data.filter((e) => e.is_active);
        setEquipment(active);
      })
      .catch(() => toast.error("Could not load equipment list."))
      .finally(() => setLoadingEq(false));
  }, []);

  const set = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.value,
      // Reset instrument_part when equipment changes
      ...(field === "equipment_id" ? { instrument_part: "" } : {}),
    }));

  const selectedEq = equipment.find((e) => String(e.id) === String(form.equipment_id));
  const subsystems  = selectedEq?.subsystems ?? [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.instrument_part || !form.problem_description || !form.reporter_name) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        equipment_id: form.equipment_id ? parseInt(form.equipment_id) : null,
      };
      const res = await createTicket(payload);
      toast.success("Ticket created successfully!");
      navigate(`/tickets/${res.data.id}`);
    } catch {
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Report an Issue</h1>
        <p className="text-slate-500 text-sm mt-1">
          Submit a maintenance ticket for a lab instrument.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100"
      >
        {/* Equipment */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Equipment <span className="text-red-500">*</span>
          </label>

          {loadingEq ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading equipment…
            </div>
          ) : equipment.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                No equipment registered yet.{" "}
                <Link to="/equipment/new" className="underline font-medium hover:text-amber-800">
                  Add equipment first
                </Link>
                , or leave unassigned.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {equipment.map((eq) => {
                const selected = String(form.equipment_id) === String(eq.id);
                return (
                  <label
                    key={eq.id}
                    className={`flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition-all
                      ${selected
                        ? "ring-2 ring-blue-400 border-blue-300 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="equipment_id"
                      value={String(eq.id)}
                      checked={selected}
                      onChange={set("equipment_id")}
                      className="sr-only"
                    />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                      ${selected ? "bg-blue-600" : "bg-slate-100"}`}>
                      <Microscope className={`w-4 h-4 ${selected ? "text-white" : "text-slate-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${selected ? "text-blue-700" : "text-slate-700"}`}>
                        {eq.name}
                      </p>
                      {eq.location && (
                        <p className="text-xs text-slate-400 truncate">{eq.location}</p>
                      )}
                    </div>
                    {eq.subsystems?.length > 0 && (
                      <span className="text-xs text-slate-400 shrink-0">
                        {eq.subsystems.length} parts
                      </span>
                    )}
                  </label>
                );
              })}
              {/* Unassigned option */}
              <label
                className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-all
                  ${!form.equipment_id
                    ? "ring-2 ring-slate-400 border-slate-300 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
              >
                <input
                  type="radio"
                  name="equipment_id"
                  value=""
                  checked={!form.equipment_id}
                  onChange={(e) => setForm((f) => ({ ...f, equipment_id: "", instrument_part: "" }))}
                  className="sr-only"
                />
                <span className="text-xs text-slate-400 italic">Not linked to a specific instrument</span>
              </label>
            </div>
          )}
        </div>

        {/* Instrument Part */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Instrument Part / Subsystem <span className="text-red-500">*</span>
          </label>

          {subsystems.length > 0 ? (
            <>
              <select
                value={form.instrument_part}
                onChange={set("instrument_part")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm
                  text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              >
                <option value="">— Select a subsystem —</option>
                {subsystems.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
                <option value="Other">Other / Not listed</option>
              </select>
              {form.instrument_part === "Other" && (
                <input
                  type="text"
                  placeholder="Describe the part or subsystem"
                  className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, _customPart: e.target.value }))
                  }
                />
              )}
            </>
          ) : (
            <input
              type="text"
              value={form.instrument_part}
              onChange={set("instrument_part")}
              placeholder="e.g. Nozzle / Flow Cell, PMT Array, Laser 488nm…"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm
                text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
              required
            />
          )}
          {form.instrument_part === "Other" && form._customPart && (
            <p className="text-xs text-slate-400 mt-1.5">
              Tip: you can add this as a named subsystem on the{" "}
              <Link to={`/equipment/${form.equipment_id}`} className="text-blue-500 hover:underline">
                Equipment page
              </Link>{" "}
              for future tickets.
            </p>
          )}
        </div>

        {/* Problem Description */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Problem Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.problem_description}
            onChange={set("problem_description")}
            rows={6}
            placeholder="Describe the issue in detail: what happened, when it started, any error codes, conditions observed, steps already attempted…"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm
              text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400
              resize-y placeholder:text-slate-400"
            required
          />
        </div>

        {/* Severity */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Severity <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isSelected = form.severity === key;
              return (
                <label
                  key={key}
                  className={`flex flex-col gap-1.5 border rounded-xl p-3.5 cursor-pointer transition-all
                    ${isSelected ? cfg.selected : "border-slate-200 hover:border-slate-300 bg-white"}`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={key}
                    checked={isSelected}
                    onChange={set("severity")}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? "" : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${isSelected ? "" : "text-slate-600"}`}>{cfg.label}</span>
                  </div>
                  <p className={`text-xs leading-snug ${isSelected ? "opacity-80" : "text-slate-400"}`}>
                    {cfg.desc}
                  </p>
                </label>
              );
            })}
          </div>
        </div>

        {/* Reporter */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.reporter_name}
            onChange={set("reporter_name")}
            placeholder="e.g. Dr. Jane Smith"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm
              text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
            required
          />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
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
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
}
