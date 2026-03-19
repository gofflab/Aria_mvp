import { Link, useLocation } from "react-router-dom";
import { Beaker, LayoutDashboard, PlusCircle, History } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/new", label: "New Ticket", icon: PlusCircle },
  { to: "/history", label: "History", icon: History },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-14">
        <Link to="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg shrink-0">
          <Beaker className="w-5 h-5" />
          Aria III Maintenance
        </Link>
        <nav className="flex gap-1 ml-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${pathname === to
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
