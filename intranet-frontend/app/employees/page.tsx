"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Employee, Department } from "@/lib/api";
import { createEmployee, deleteEmployee, getEmployees, getDepartments } from "@/lib/api";
import { useLanguage } from "@/components/i18n";

const allValue = "ALL";

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

export default function EmployeesPage() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Filter states
  const [department, setDepartment] = useState(allValue);
  const [role, setRole] = useState(allValue);
  
  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    position: "",
    department: "", // This will store the NAME string, not ID
    role: "",
  });

  useEffect(() => {
    let active = true;
    Promise.all([getEmployees(), getDepartments()]).then(([empsData, deptsData]) => {
      if (active) {
        setEmployees(empsData);
        setDepartments(deptsData);
      }
    }).catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  const roles = useMemo(() => {
    const values = new Set(employees.map((item) => item.role));
    return [allValue, ...Array.from(values)];
  }, [employees]);
  
  // We can use departments list for filter pills too, or just based on existing employees
  const availableDepts = useMemo(() => {
     // Use department names from API if possible, fallback to employee data
     const names = new Set(departments.map(d => d.name));
     if (names.size === 0) {
         employees.forEach(e => names.add(e.department));
     }
     return [allValue, ...Array.from(names)];
  }, [departments, employees]);


  const filtered = useMemo(() => {
    return employees.filter((item) => {
      const departmentOk = department === allValue || item.department === department;
      const roleOk = role === allValue || item.role === role;
      return departmentOk && roleOk;
    });
  }, [employees, department, role]);

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      position: form.position.trim(),
      department: form.department.trim(), // Name string
      role: form.role.trim(),
    };

    if (!trimmed.name || !trimmed.department || !trimmed.email) {
      return; 
    }

    createEmployee(trimmed)
      .then((created) => {
        setEmployees((prev) => [created, ...prev]);
        setForm({
          name: "",
          email: "",
          position: "",
          department: "",
          role: "",
        });
      })
      .catch((err) => {
        alert(t("employees.create.error"));
        console.error(err);
      });
  };

  const handleDelete = (id: number) => {
      deleteEmployee(id)
        .then(() => {
          setEmployees((prev) => prev.filter((item) => item.id !== id));
        })
        .catch((err) => {
          alert(t("employees.delete.error"));
          console.error(err);
        });
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
          className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
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
              {t("employees.form.email")}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("employees.form.email.placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("employees.form.department")}
            </label>
            <select
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              required
            >
                <option value="">{t("common.select.department")}</option>
                {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option> 
                ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("employees.form.position")}
            </label>
            <input
              value={form.position}
              onChange={(event) => setForm({ ...form, position: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("employees.form.position.placeholder")}
              required
            />
          </div>
           <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("employees.form.role")}
            </label>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              required
            >
                <option value="">{t("common.select.role")}</option>
                <option value="employee">{t("roles.employee")}</option>
                <option value="manager">{t("roles.manager")}</option>
                <option value="admin">{t("roles.admin")}</option>
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
            {availableDepts.map((value) => (
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
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="animated-border group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.position}</p>
                </div>
                 <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-rose-500"
                  title={t("common.delete")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 grid gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-400 uppercase tracking-wider text-[10px]">{t("common.dept")}</span>
                  {item.department}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-400 uppercase tracking-wider text-[10px]">{t("employees.form.email")}</span>
                  {item.email}
                </div>
                 <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-400 uppercase tracking-wider text-[10px]">{t("employees.table.role")}</span>
                  {item.role}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-slate-500">
            {t("employees.empty")}
          </div>
        )}
      </section>
    </div>
  );
}
