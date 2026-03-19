import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import NewTicket from "./pages/NewTicket";
import TicketDetail from "./pages/TicketDetail";
import History from "./pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewTicket />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
        <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200 mt-auto">
          BD FACS Aria III Maintenance Tracker — Lab Equipment Management
        </footer>
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
