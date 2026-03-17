"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Ticket } from "@/lib/mockData";
import { createTicket, deleteTicket, getTickets } from "@/lib/api";
import { useLanguage } from "@/components/i18n";

const statusStyles: Record<Ticket["status"], string> = {
  Open: "bg-sky-50 text-sky-700 border-sky-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Waiting: "bg-slate-50 text-slate-600 border-slate-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityStyles: Record<Ticket["priority"], string> = {
  Low: "bg-slate-50 text-slate-600 border-slate-200",
  Medium: "bg-indigo-50 text-indigo-700 border-indigo-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Critical: "bg-rose-50 text-rose-700 border-rose-200",
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
      className={`animated-border rounded-full border px-3 py-1 text-xs font-medium transition ${
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
  const allValue = "ALL";
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState(allValue);
  const [priority, setPriority] = useState(allValue);
  const [form, setForm] = useState({
    title: "",
    category: "",
    requester: "",
    assignee: "",
    status: "Open" as Ticket["status"],
    priority: "Medium" as Ticket["priority"],
  });

  useEffect(() => {
    let active = true;
    getTickets().then((data) => {
      if (active) {
        setTickets(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const statuses = useMemo(() => {
    const values = new Set(tickets.map((item) => item.status));
    return [allValue, ...Array.from(values)];
  }, [tickets]);

  const priorities = useMemo(() => {
    const values = new Set(tickets.map((item) => item.priority));
    return [allValue, ...Array.from(values)];
  }, [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter((item) => {
      const statusOk = status === allValue || item.status === status;
      const priorityOk = priority === allValue || item.priority === priority;
      return statusOk && priorityOk;
    });
  }, [tickets, status, priority]);

  const statusLabels: Record<Ticket["status"], string> = {
    Open: t("tickets.status.open"),
    "In Progress": t("tickets.status.progress"),
    Waiting: t("tickets.status.waiting"),
    Resolved: t("tickets.status.resolved"),
  };

  const priorityLabels: Record<Ticket["priority"], string> = {
    Low: t("tickets.priority.low"),
    Medium: t("tickets.priority.medium"),
    High: t("tickets.priority.high"),
    Critical: t("tickets.priority.critical"),
  };

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = {
      title: form.title.trim(),
      category: form.category.trim(),
      requester: form.requester.trim(),
      assignee: form.assignee.trim(),
    };

    if (!trimmed.title) {
      return;
    }

    const fallbackNext: Ticket = {
      id: `TCK-${Date.now()}`,
      title: trimmed.title,
      category: trimmed.category || "General",
      requester: trimmed.requester || "-",
      assignee: trimmed.assignee || "-",
      status: form.status,
      priority: form.priority,
      updated: new Date().toLocaleString("ru-RU", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Пытаемся создать в бэкенде (он требует title/description/department).
    // Department берется из /api/auth/me/ (см. lib/api.ts).
    const description = [
      trimmed.category ? `Category: ${trimmed.category}` : null,
      trimmed.requester ? `Requester: ${trimmed.requester}` : null,
      trimmed.assignee ? `Assignee: ${trimmed.assignee}` : null,
    ]
      .filter(Boolean)
      .join("\n")
      .trim();

    createTicket({
      title: trimmed.title,
      description: description.length > 0 ? description : "-",
    })
      .then((created) => {
        setTickets((prev) => [created, ...prev]);
      })
      .catch(() => {
        // Если бэкенд недоступен/не настроен — оставляем локальное поведение.
        setTickets((prev) => [fallbackNext, ...prev]);
      });

    setForm({
      title: "",
      category: "",
      requester: "",
      assignee: "",
      status: "Open",
      priority: "Medium",
    });
  };

  const handleDelete = (id: string) => {
    const found = tickets.find((item) => item.id === id);
    const apiId = found?.apiId;

    if (apiId) {
      deleteTicket(apiId)
        .then(() => {
          setTickets((prev) => prev.filter((item) => item.id !== id));
        })
        .catch(() => {
          // фолбек: просто убираем из UI
          setTickets((prev) => prev.filter((item) => item.id !== id));
        });
      return;
    }

    setTickets((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("tickets.label")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t("tickets.title")}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {t("tickets.subtitle")}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          {t("common.showing")} <span className="font-semibold text-slate-800">{filtered.length}</span>
        </div>
      </header>

      <section className="animated-border rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("tickets.new.title")}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {t("tickets.new.subtitle")}
            </p>
          </div>
          <button
            type="submit"
            form="ticket-form"
            className="animated-border group inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {t("tickets.add")}
          </button>
        </div>
        <form id="ticket-form" onSubmit={handleAdd} className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-3">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("tickets.form.title")}
            </label>
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("tickets.form.title.placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("tickets.form.category")}
            </label>
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("tickets.form.category.placeholder")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("tickets.form.requester")}
            </label>
            <input
              value={form.requester}
              onChange={(event) => setForm({ ...form, requester: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("tickets.form.person.placeholder")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("tickets.form.assignee")}
            </label>
            <input
              value={form.assignee}
              onChange={(event) => setForm({ ...form, assignee: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("tickets.form.person.placeholder")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("tickets.form.status")}
            </label>
            <select
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as Ticket["status"] })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="Open">{statusLabels.Open}</option>
              <option value="In Progress">{statusLabels["In Progress"]}</option>
              <option value="Waiting">{statusLabels.Waiting}</option>
              <option value="Resolved">{statusLabels.Resolved}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("tickets.form.priority")}
            </label>
            <select
              value={form.priority}
              onChange={(event) =>
                setForm({ ...form, priority: event.target.value as Ticket["priority"] })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="Low">{priorityLabels.Low}</option>
              <option value="Medium">{priorityLabels.Medium}</option>
              <option value="High">{priorityLabels.High}</option>
              <option value="Critical">{priorityLabels.Critical}</option>
            </select>
          </div>
        </form>
      </section>

      <section className="animated-border grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("tickets.form.status")}
          </p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((value) => (
              <FilterPill
                key={value}
                label={value === allValue ? t("common.all") : statusLabels[value as Ticket["status"]]}
                active={status === value}
                onClick={() => setStatus(value)}
              />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("tickets.form.priority")}
          </p>
          <div className="flex flex-wrap gap-2">
            {priorities.map((value) => (
              <FilterPill
                key={value}
                label={value === allValue ? t("common.all") : priorityLabels[value as Ticket["priority"]]}
                active={priority === value}
                onClick={() => setPriority(value)}
              />
            ))}
          </div>
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => {
              setStatus(allValue);
              setPriority(allValue);
            }}
            className="animated-border rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-600 hover:bg-slate-100"
          >
            {t("common.reset")}
          </button>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="animated-border rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {t("tickets.empty")}
        </section>
      ) : (
        <section className="animated-border hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-3">{t("tickets.table.ticket")}</th>
                <th className="px-6 py-3">{t("tickets.table.status")}</th>
                <th className="px-6 py-3">{t("tickets.table.priority")}</th>
                <th className="px-6 py-3">{t("tickets.table.assignee")}</th>
                <th className="px-6 py-3">{t("tickets.table.updated")}</th>
                <th className="px-6 py-3 text-right">{t("tickets.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500">
                      {item.id} • {item.category} • {item.requester}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setStatus(item.status)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        statusStyles[item.status]
                      }`}
                    >
                      {statusLabels[item.status]}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setPriority(item.priority)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        priorityStyles[item.priority]
                      }`}
                    >
                      {priorityLabels[item.priority]}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.assignee}</td>
                  <td className="px-6 py-4 text-slate-600">{item.updated}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="animated-border rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                    >
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {filtered.length > 0 && (
        <section className="grid gap-4 md:hidden">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="animated-border rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {item.id} • {item.category}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(item.status)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      statusStyles[item.status]
                    }`}
                  >
                    {statusLabels[item.status]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority(item.priority)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      priorityStyles[item.priority]
                    }`}
                  >
                    {priorityLabels[item.priority]}
                  </button>
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-600">
                {t("tickets.meta.assignee")} {item.assignee}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {t("tickets.meta.updated")} {item.updated}
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="animated-border rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500"
                >
                  {t("common.delete")}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
