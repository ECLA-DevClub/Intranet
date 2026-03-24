"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Ticket, Department, Employee } from "@/lib/api";
import { createTicket, deleteTicket, getTickets, getDepartments, getEmployees, updateTicketStatus, assignTicket } from "@/lib/api";
import { useLanguage } from "@/components/i18n";

const allValue = "ALL";

// Status localized labels map (could be moved to i18n but keeping simple)
// Moved inside component to use translation hook

const statusStyles: Record<string, string> = {
  open: "bg-sky-50 text-sky-700 border-sky-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`animated-border rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-slate-400 bg-slate-200 text-slate-900"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

export default function TicketsPage() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [status, setStatus] = useState(allValue);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "", // ID as string
  });

  const statusLabels: Record<string, string> = useMemo(() => ({
    open: t("tickets.status.open"),
    in_progress: t("tickets.status.progress"),
    closed: t("tickets.status.resolved"),
  }), [t]);

  useEffect(() => {
    let active = true;
    Promise.all([getTickets(), getDepartments(), getEmployees()]).then(([ticketsData, deptsData, empsData]) => {
      if (active) {
        setTickets(ticketsData);
        setDepartments(deptsData);
        setEmployees(empsData);
      }
    }).catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((item) => {
      return status === allValue || item.status === status;
    });
  }, [tickets, status]);

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title || !form.department) return;

    createTicket({
        title: form.title,
        description: form.description,
        department: Number(form.department) // Convert string ID to number
    }).then((created) => {
        setTickets(prev => [created, ...prev]);
        setForm({ title: "", description: "", department: "" });
    }).catch(err => {
        alert(t("tickets.create.error"));
        console.error(err);
    });
  };

  const handleStatusChange = (id: number, newStatus: "in_progress" | "closed") => {
      updateTicketStatus(id, newStatus).then((updated) => {
          setTickets(prev => prev.map(t => t.id === id ? updated : t));
      }).catch(err => {
          alert(t("tickets.update.error"));
          console.error(err);
      });
  };

  const handleDelete = (id: number) => {
      if (!confirm(t("common.confirm"))) return;
      deleteTicket(id).then(() => {
          setTickets(prev => prev.filter(t => t.id !== id));
      }).catch(err => {
          alert(t("tickets.delete.error"));
          console.error(err);
      });
  };

  const handleAssign = (id: number, assigneeId: string) => {
    if (!assigneeId) return;
    const empId = Number(assigneeId);
    assignTicket(id, empId)
      .then(() => {
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, assignee: empId } : t))
        );
      })
      .catch((err) => {
        alert(t("tickets.assign.error"));
        console.error(err);
      });
  };
  
  // Helper to get department name from ID
  const getDeptName = (id: number | Department) => {
      if (typeof id === 'object') return id.name;
      const d = departments.find(dep => dep.id === id);
      return d ? d.name : `Dept #${id}`;
  };

  return (
    <div className="space-y-8">
      <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("tickets.label")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {t("tickets.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t("tickets.subtitle")}
          </p>
      </header>

      {/* New Ticket Form */}
      <section className="animated-border rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">{t("tickets.new.title")}</h2>
        <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("tickets.form.title")}
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              placeholder={t("tickets.form.title.placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
               {t("tickets.form.department")}
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              required
            >
                <option value="">{t("common.select.department")}</option>
                {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option> // ID Value
                ))}
            </select>
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("tickets.form.description")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              rows={3}
              placeholder={t("tickets.form.description.placeholder")}
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end">
             <button
               type="submit"
               className="animated-border rounded-xl bg-slate-900 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
             >
               {t("tickets.add")}
             </button>
          </div>
        </form>
      </section>

      {/* Filter */}
      <section className="flex flex-wrap gap-2">
          <FilterPill
            label={t("common.all")}
            active={status === allValue}
            onClick={() => setStatus(allValue)}
          />
          {Object.keys(statusLabels).map((key) => (
             <FilterPill
                key={key}
                label={statusLabels[key]}
                active={status === key}
                onClick={() => setStatus(key)}
             />
          ))}
      </section>

      {/* List */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ticket) => (
          <div
            key={ticket.id}
            className="animated-border group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium border ${statusStyles[ticket.status]}`}>
                   {statusLabels[ticket.status] ?? ticket.status}
                </span>
                <button 
                  onClick={() => handleDelete(ticket.id)}
                  className="text-slate-400 hover:text-rose-500"
                  title={t("common.delete")}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                   </svg>
                </button>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{ticket.title}</h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{ticket.description}</p>
              
              <div className="mt-4 flex flex-col gap-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                      <span>{t("common.dept")}</span>
                      <span className="font-medium text-slate-700">{getDeptName(ticket.department)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t("common.assignee")}</span>
                    <select
                      className="max-w-[140px] truncate rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
                      value={ticket.assignee || ""}
                      onChange={(e) => handleAssign(ticket.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">{t("common.unassigned")}</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between">
                     <span>{t("common.created")}</span>
                     <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 border-t border-slate-100 pt-3 flex justify-end gap-2">
               {ticket.status === 'open' && (
                  <button 
                    onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                    className="text-xs font-medium text-sky-600 hover:text-sky-700"
                  >
                    {t("tickets.action.start")}
                  </button>
               )}
               {ticket.status === 'in_progress' && (
                  <button 
                    onClick={() => handleStatusChange(ticket.id, 'closed')}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    {t("tickets.action.close")}
                  </button>
               )}
               {ticket.status === 'closed' && (
                   <span className="text-xs text-slate-400">{t("tickets.action.archived")}</span>
               )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-slate-500">
            {t("tickets.empty")}
          </div>
        )}
      </section>
    </div>
  );
}
