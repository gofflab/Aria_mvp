import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import TicketCard from "./TicketCard";
import { updateTicket } from "../api/tickets";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

const COLUMNS = [
  {
    id: "Open",
    label: "Open",
    headerBg: "bg-sky-500",
    headerText: "text-white",
    dropBg: "bg-sky-50/60",
    dropActiveBg: "bg-sky-100",
    countBg: "bg-sky-400/60",
  },
  {
    id: "In Progress",
    label: "In Progress",
    headerBg: "bg-amber-500",
    headerText: "text-white",
    dropBg: "bg-amber-50/60",
    dropActiveBg: "bg-amber-100",
    countBg: "bg-amber-400/60",
  },
  {
    id: "Resolved",
    label: "Resolved",
    headerBg: "bg-emerald-500",
    headerText: "text-white",
    dropBg: "bg-emerald-50/60",
    dropActiveBg: "bg-emerald-100",
    countBg: "bg-emerald-400/60",
  },
  {
    id: "Closed",
    label: "Closed",
    headerBg: "bg-slate-400",
    headerText: "text-white",
    dropBg: "bg-slate-100/60",
    dropActiveBg: "bg-slate-200",
    countBg: "bg-slate-300/80",
  },
];

export default function KanbanBoard({ tickets, onTicketsChange, equipmentMap = {} }) {
  const [movingId, setMovingId] = useState(null);

  // Build column→tickets map, preserving order
  const columnMap = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
  tickets.forEach((t) => {
    if (columnMap[t.status] !== undefined) columnMap[t.status].push(t);
  });

  const onDragEnd = async (result) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const ticketId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId;

    if (source.droppableId === newStatus) return;

    // Optimistic update
    const prevTickets = tickets;
    const optimistic = tickets.map((t) =>
      t.id === ticketId ? { ...t, status: newStatus } : t
    );
    onTicketsChange(optimistic);
    setMovingId(ticketId);

    try {
      await updateTicket(ticketId, { status: newStatus });
      toast.success(`Moved to "${newStatus}"`);
    } catch {
      onTicketsChange(prevTickets);
      toast.error("Failed to update status.");
    } finally {
      setMovingId(null);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTickets = columnMap[col.id];
          return (
            <div key={col.id} className="flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white min-h-[480px]">
              {/* Column header */}
              <div className={`${col.headerBg} ${col.headerText} px-4 py-3 flex items-center justify-between`}>
                <span className="text-sm font-semibold tracking-wide">{col.label}</span>
                <span className={`${col.countBg} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                  {colTickets.length}
                </span>
              </div>

              {/* Drop zone */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-col gap-2 p-3 transition-colors min-h-[420px]
                      ${snapshot.isDraggingOver ? col.dropActiveBg : col.dropBg}`}
                  >
                    {colTickets.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 py-8">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <Plus className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-center">
                          {col.id === "Open" ? (
                            <Link to="/new" className="text-blue-500 hover:underline">
                              Create a ticket
                            </Link>
                          ) : (
                            "Drag tickets here"
                          )}
                        </p>
                      </div>
                    )}

                    {colTickets.map((ticket, index) => (
                      <Draggable
                        key={ticket.id}
                        draggableId={String(ticket.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                            className={`transition-opacity ${movingId === ticket.id && !snapshot.isDragging ? "opacity-50" : ""}`}
                          >
                            <TicketCard
                              ticket={ticket}
                              equipmentName={ticket.equipment_id ? equipmentMap[ticket.equipment_id] : undefined}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
