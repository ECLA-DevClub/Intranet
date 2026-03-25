"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Department } from "@/lib/api";
import { createDepartment, deleteDepartment, getDepartments } from "@/lib/api";
import { useLanguage } from "@/components/i18n";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DepartmentsPage() {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // Confirmation state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;

    createDepartment(name, description)
      .then((created) => {
        setDepartments((prev) => [...prev, created]);
        setName("");
        setDescription("");
      })
      .catch((err) => {
        alert(t("departments.create.error"));
        console.error(err);
      });
  };

  const confirmDelete = () => {
    if (deletingId === null) return;
    
    deleteDepartment(deletingId)
      .then(() => {
        setDepartments((prev) => prev.filter((d) => d.id !== deletingId));
      })
      .catch((err) => {
        alert(t("departments.delete.error"));
        console.error(err);
      })
      .finally(() => {
        setDeletingId(null);
      });
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {t("departments.label")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {t("departments.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {t("departments.subtitle")}
        </p>
      </header>

      <section className="animated-border rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          {t("departments.new.title")}
        </h2>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("departments.form.name")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              placeholder={t("departments.form.name.placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("departments.form.description")}
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              placeholder={t("departments.form.description.placeholder")}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="animated-border rounded-xl bg-slate-900 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              {t("departments.add")}
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="animated-border group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                <button
                  onClick={() => setDeletingId(dept.id)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
              {dept.description && (
                <p className="mt-2 text-sm text-slate-500">{dept.description}</p>
              )}
            </div>
          </div>
        ))}
        {departments.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-slate-500">
            {t("departments.empty")}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={deletingId !== null}
        message={t("departments.delete.confirm")}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
        isDestructive
      />
    </div>
  );
}