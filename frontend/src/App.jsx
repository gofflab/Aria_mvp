import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import NewTicket from "./pages/NewTicket";
import TicketDetail from "./pages/TicketDetail";
import History from "./pages/History";
import Equipment from "./pages/Equipment";
import NewEquipment from "./pages/NewEquipment";
import EquipmentDetail from "./pages/EquipmentDetail";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"                   element={<Dashboard />} />
            <Route path="/new"                element={<NewTicket />} />
            <Route path="/tickets/:id"        element={<TicketDetail />} />
            <Route path="/history"            element={<History />} />
            <Route path="/equipment"          element={<Equipment />} />
            <Route path="/equipment/new"      element={<NewEquipment />} />
            <Route path="/equipment/:id"      element={<EquipmentDetail />} />
          </Routes>
        </main>
        <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
          Lab Equipment Maintenance Tracker · Multi-Instrument Management
        </footer>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontSize: "13px",
            fontFamily: "Inter, system-ui, sans-serif",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </BrowserRouter>
  );
}
