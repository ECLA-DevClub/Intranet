"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Employee } from "@/lib/mockData";
import { createEmployee, deleteEmployee, getEmployees } from "@/lib/api";
import { useLanguage } from "@/components/i18n";

const statusStyles: Record<Employee["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Remote: "bg-sky-50 text-sky-700 border-sky-200",
  "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
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

export default function EmployeesPage() {
  const { t } = useLanguage();
  const allValue = "ALL";
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [department, setDepartment] = useState(allValue);
  const [role, setRole] = useState(allValue);
  const [form, setForm] = useState({
    name: "",
    role: "",
    department: "",
    email: "",
    location: "",
    status: "Active" as Employee["status"],
  });

  useEffect(() => {
    let active = true;
    getEmployees().then((data) => {
      if (active) {
        setEmployees(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const departments = useMemo(() => {
    const values = new Set(employees.map((item) => item.department));
    return [allValue, ...Array.from(values)];
  }, [employees]);

  const roles = useMemo(() => {
    const values = new Set(employees.map((item) => item.role));
    return [allValue, ...Array.from(values)];
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter((item) => {
      const departmentOk = department === allValue || item.department === department;
      const roleOk = role === allValue || item.role === role;
      return departmentOk && roleOk;
    });
  }, [employees, department, role]);

  const statusLabels: Record<Employee["status"], string> = {
    Active: t("employees.status.active"),
    Remote: t("employees.status.remote"),
    "On Leave": t("employees.status.leave"),
  };

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = {
      name: form.name.trim(),
      role: form.role.trim(),
      department: form.department.trim(),
      email: form.email.trim(),
      location: form.location.trim(),
    };

    if (!trimmed.name || !trimmed.role || !trimmed.department) {
      return;
    }

    const fallbackNext: Employee = {
      id: `EMP-${Date.now()}`,
      name: trimmed.name,
      role: trimmed.role,
      department: trimmed.department,
      email: trimmed.email || "-",
      location: trimmed.location || "-",
      status: form.status,
    };

    createEmployee({
      name: trimmed.name,
      email: trimmed.email || `${Date.now()}@example.com`,
      position: trimmed.role,
      department: trimmed.department,
      role: trimmed.role,
    })
      .then((created) => {
        setEmployees((prev) => [created, ...prev]);
      })
      .catch(() => {
        setEmployees((prev) => [fallbackNext, ...prev]);
      });

    setForm({
      name: "",
      role: "",
      department: "",
      email: "",
      location: "",
      status: "Active",
    });
  };

  const handleDelete = (id: string) => {
    const found = employees.find((item) => item.id === id);
    const apiId = found?.apiId;

    if (apiId) {
      deleteEmployee(apiId)
        .then(() => {
          setEmployees((prev) => prev.filter((item) => item.id !== id));
        })
        .catch(() => {
          setEmployees((prev) => prev.filter((item) => item.id !== id));
        });
      return;
    }

    setEmployees((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("employees.label")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {t("employees.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t("employees.subtitle")}
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
              {t("employees.new.title")}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {t("employees.new.subtitle")}
            </p>
          </div>
          <button
            type="submit"
            form="employee-form"
            className="animated-border group inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {t("employees.add")}
          </button>
        </div>
        <form
          id="employee-form"
          onSubmit={handleAdd}
          className="mt-6 grid gap-4 md:grid-cols-3"
        >
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("employees.form.name")}
            </label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("employees.form.name.placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("employees.form.role")}
            </label>
            <input
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("employees.form.role.placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("employees.form.department")}
            </label>
            <input
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("employees.form.department.placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("employees.form.email")}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("employees.form.email.placeholder")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("employees.form.location")}
            </label>
            <input
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("employees.form.location.placeholder")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("employees.form.status")}
            </label>
            <select
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as Employee["status"] })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="Active">{statusLabels.Active}</option>
              <option value="Remote">{statusLabels.Remote}</option>
              <option value="On Leave">{statusLabels["On Leave"]}</option>
            </select>
          </div>
        </form>
      </section>

      <section className="animated-border grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("employees.form.department")}
          </p>
          <div className="flex flex-wrap gap-2">
            {departments.map((value) => (
              <FilterPill
                key={value}
                label={value === allValue ? t("common.all") : value}
                active={department === value}
                onClick={() => setDepartment(value)}
              />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("employees.form.role")}
          </p>
          <div className="flex flex-wrap gap-2">
            {roles.map((value) => (
              <FilterPill
                key={value}
                label={value === allValue ? t("common.all") : value}
                active={role === value}
                onClick={() => setRole(value)}
              />
            ))}
          </div>
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => {
              setDepartment(allValue);
              setRole(allValue);
            }}
            className="animated-border rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-600 hover:bg-slate-100"
          >
            {t("common.reset")}
          </button>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="animated-border rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {t("employees.empty")}
        </section>
      ) : (
        <section className="animated-border hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-3">{t("employees.table.employee")}</th>
                <th className="px-6 py-3">{t("employees.table.role")}</th>
                <th className="px-6 py-3">{t("employees.table.department")}</th>
                <th className="px-6 py-3">{t("employees.table.location")}</th>
                <th className="px-6 py-3">{t("employees.table.status")}</th>
                <th className="px-6 py-3 text-right">{t("employees.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setRole(item.role)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      {item.role}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setDepartment(item.department)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      {item.department}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.location}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                        statusStyles[item.status]
                      }`}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </td>
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
                    {item.name}
                  </h2>
                  <p className="text-xs text-slate-500">{item.email}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                    statusStyles[item.status]
                  }`}
                >
                  {statusLabels[item.status]}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRole(item.role)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                >
                  {item.role}
                </button>
                <button
                  type="button"
                  onClick={() => setDepartment(item.department)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                >
                  {item.department}
                </button>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                  {item.location}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="animated-border rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-500"
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
