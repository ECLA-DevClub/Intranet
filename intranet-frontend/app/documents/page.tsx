"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { DocumentItem } from "@/lib/mockData";
import { deleteDocument, getDocuments } from "@/lib/api";
import { useLanguage } from "@/components/i18n";

const accessStyles: Record<DocumentItem["access"], string> = {
  Public: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Internal: "bg-slate-50 text-slate-600 border-slate-200",
  Restricted: "bg-rose-50 text-rose-700 border-rose-200",
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

export default function DocumentsPage() {
  const { t } = useLanguage();
  const allValue = "ALL";
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [category, setCategory] = useState(allValue);
  const [department, setDepartment] = useState(allValue);
  const [form, setForm] = useState({
    title: "",
    category: "",
    department: "",
    owner: "",
    access: "Internal" as DocumentItem["access"],
  });

  useEffect(() => {
    let active = true;
    getDocuments().then((data) => {
      if (active) {
        setDocuments(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const values = new Set(documents.map((item) => item.category));
    return [allValue, ...Array.from(values)];
  }, [documents]);

  const departments = useMemo(() => {
    const values = new Set(documents.map((item) => item.department));
    return [allValue, ...Array.from(values)];
  }, [documents]);

  const filtered = useMemo(() => {
    return documents.filter((item) => {
      const categoryOk = category === allValue || item.category === category;
      const departmentOk = department === allValue || item.department === department;
      return categoryOk && departmentOk;
    });
  }, [documents, category, department]);

  const accessLabels: Record<DocumentItem["access"], string> = {
    Public: t("documents.access.public"),
    Internal: t("documents.access.internal"),
    Restricted: t("documents.access.restricted"),
  };

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = {
      title: form.title.trim(),
      category: form.category.trim(),
      department: form.department.trim(),
      owner: form.owner.trim(),
    };

    if (!trimmed.title) {
      return;
    }

    const next: DocumentItem = {
      id: `DOC-${Date.now()}`,
      title: trimmed.title,
      category: trimmed.category || "General",
      department: trimmed.department || "-",
      owner: trimmed.owner || "-",
      updated: new Date().toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
      }),
      access: form.access,
    };

    setDocuments((prev) => [next, ...prev]);
    setForm({
      title: "",
      category: "",
      department: "",
      owner: "",
      access: "Internal",
    });
  };

  const handleDelete = (id: string) => {
    const found = documents.find((item) => item.id === id);
    const apiId = found?.apiId;

    if (apiId) {
      deleteDocument(apiId)
        .then(() => {
          setDocuments((prev) => prev.filter((item) => item.id !== id));
        })
        .catch(() => {
          setDocuments((prev) => prev.filter((item) => item.id !== id));
        });
      return;
    }

    setDocuments((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("documents.label")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {t("documents.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t("documents.subtitle")}
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
              {t("documents.new.title")}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {t("documents.new.subtitle")}
            </p>
          </div>
          <button
            type="submit"
            form="document-form"
            className="animated-border group inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {t("documents.add")}
          </button>
        </div>
        <form
          id="document-form"
          onSubmit={handleAdd}
          className="mt-6 grid gap-4 md:grid-cols-3"
        >
          <div className="space-y-2 md:col-span-3">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("documents.form.title")}
            </label>
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("documents.form.title.placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("documents.form.category")}
            </label>
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("documents.form.category.placeholder")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("documents.form.department")}
            </label>
            <input
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("documents.form.department.placeholder")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("documents.form.owner")}
            </label>
            <input
              value={form.owner}
              onChange={(event) => setForm({ ...form, owner: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              placeholder={t("documents.form.owner.placeholder")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("documents.form.access")}
            </label>
            <select
              value={form.access}
              onChange={(event) =>
                setForm({ ...form, access: event.target.value as DocumentItem["access"] })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="Public">{accessLabels.Public}</option>
              <option value="Internal">{accessLabels.Internal}</option>
              <option value="Restricted">{accessLabels.Restricted}</option>
            </select>
          </div>
        </form>
      </section>

      <section className="animated-border grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("documents.form.category")}
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((value) => (
              <FilterPill
                key={value}
                label={value === allValue ? t("common.all") : value}
                active={category === value}
                onClick={() => setCategory(value)}
              />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("documents.form.department")}
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
        <div className="md:col-span-2 flex flex-wrap gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => {
              setCategory(allValue);
              setDepartment(allValue);
            }}
            className="animated-border rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-600 hover:bg-slate-100"
          >
            {t("common.reset")}
          </button>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="animated-border rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {t("documents.empty")}
        </section>
      ) : (
        <section className="animated-border hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-3">{t("documents.table.document")}</th>
                <th className="px-6 py-3">{t("documents.table.category")}</th>
                <th className="px-6 py-3">{t("documents.table.department")}</th>
                <th className="px-6 py-3">{t("documents.table.owner")}</th>
                <th className="px-6 py-3">{t("documents.table.access")}</th>
                <th className="px-6 py-3 text-right">{t("documents.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500">
                      {item.id} • {item.updated}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setCategory(item.category)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      {item.category}
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
                  <td className="px-6 py-4 text-slate-600">{item.owner}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                        accessStyles[item.access]
                      }`}
                    >
                      {accessLabels[item.access]}
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
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {item.id} • {item.updated}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                    accessStyles[item.access]
                  }`}
                >
                  {accessLabels[item.access]}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCategory(item.category)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                >
                  {item.category}
                </button>
                <button
                  type="button"
                  onClick={() => setDepartment(item.department)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                >
                  {item.department}
                </button>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                  {item.owner}
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
