import { Link, useLocation } from "react-router-dom";
import { Microscope, LayoutDashboard, PlusCircle, History, FlaskConical } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/equipment", label: "Equipment", icon: FlaskConical },
  { to: "/history", label: "History", icon: History },
];

export default function Navbar() {
  const { pathname } = useLocation();

  // Match active nav item — /equipment/new and /equipment/:id should highlight Equipment
  const isActive = (to) => {
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(to + "/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-6 flex items-center h-14 gap-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-sm">
            <Microscope className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-sm leading-tight">
            Lab Maintenance<br />
            <span className="text-xs font-normal text-slate-400">Equipment Tracker</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${isActive(to)
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="ml-auto">
          <Link
            to="/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Ticket
          </Link>
        </div>
      </div>
    </header>
  );
}
