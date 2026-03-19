import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api/tickets";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";

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
      toast.success("Ticket created!");
      navigate(`/tickets/${res.data.id}`);
    } catch {
      toast.error("Failed to create ticket. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Report an Issue</h1>
      <p className="text-slate-500 text-sm mb-6">Create a new maintenance ticket for the BD FACS Aria III.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-5 shadow-sm">

        {/* Instrument Part */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Instrument Part / Subsystem <span className="text-red-500">*</span>
          </label>
          <select
            value={form.instrument_part}
            onChange={set("instrument_part")}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">— Select a subsystem —</option>
            {PARTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Problem Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Problem Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.problem_description}
            onChange={set("problem_description")}
            rows={5}
            placeholder="Describe the issue in detail: what happened, when, any error codes, conditions observed…"
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
            required
          />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Severity <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {["Low", "Medium", "High"].map((s) => (
              <label
                key={s}
                className={`flex-1 flex items-center justify-center gap-1.5 border rounded py-2 cursor-pointer text-sm font-medium transition-colors
                  ${form.severity === s
                    ? s === "High"
                      ? "bg-red-50 border-red-400 text-red-700"
                      : s === "Medium"
                      ? "bg-amber-50 border-amber-400 text-amber-700"
                      : "bg-green-50 border-green-400 text-green-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <input
                  type="radio"
                  name="severity"
                  value={s}
                  checked={form.severity === s}
                  onChange={set("severity")}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Reporter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.reporter_name}
            onChange={set("reporter_name")}
            placeholder="e.g. Dr. Jane Smith"
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 border border-slate-200 text-slate-600 rounded py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded py-2 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
}
