import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createTicket } from "../api/tickets";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Send, AlertTriangle, Minus, Info } from "lucide-react";

const PARTS = [
  "Laser — 488nm Blue",
  "Laser — 633nm Red",
  "Laser — 405nm Violet",
  "FSC Detector",
  "SSC Detector",
  "PMT Array",
  "Sort Collection System",
  "Nozzle / Flow Cell",
  "Fluidics System",
  "Pressure System",
  "Electronic / Software",
  "Temperature Control",
  "Sample Injection Port (SIP)",
  "Other",
];

const SEVERITY_CONFIG = {
  Low: {
    icon: Info,
    label: "Low",
    desc: "Minor issue, no impact on experiments",
    bg: "bg-emerald-50 border-emerald-300 text-emerald-700",
    selected: "ring-2 ring-emerald-400 bg-emerald-50 border-emerald-400",
  },
  Medium: {
    icon: Minus,
    label: "Medium",
    desc: "Degraded performance, workaround exists",
    bg: "bg-amber-50 border-amber-300 text-amber-700",
    selected: "ring-2 ring-amber-400 bg-amber-50 border-amber-400",
  },
  High: {
    icon: AlertTriangle,
    label: "High",
    desc: "Instrument down or unsafe to operate",
    bg: "bg-red-50 border-red-300 text-red-700",
    selected: "ring-2 ring-red-400 bg-red-50 border-red-400",
  },
};

export default function NewTicket() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    instrument_part: "",
    problem_description: "",
    severity: "Medium",
    reporter_name: "",
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.instrument_part || !form.problem_description || !form.reporter_name) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createTicket(form);
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
          Submit a maintenance ticket for the BD FACS Aria III flow cytometer.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100"
      >
        {/* Instrument Part */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Instrument Part / Subsystem <span className="text-red-500">*</span>
          </label>
          <select
            value={form.instrument_part}
            onChange={set("instrument_part")}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm
              text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
              transition-shadow"
            required
          >
            <option value="">— Select a subsystem —</option>
            {PARTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
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
              text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
              resize-y transition-shadow placeholder:text-slate-400"
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
              text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
              transition-shadow placeholder:text-slate-400"
            required
          />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 border border-slate-200 bg-white text-slate-600 rounded-lg py-2.5 text-sm font-medium
              hover:bg-slate-50 transition-colors"
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
