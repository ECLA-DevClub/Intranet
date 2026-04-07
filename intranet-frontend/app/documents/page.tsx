"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { DocumentItem, Department } from "@/lib/api";
import { createDocument, deleteDocument, getDocuments, getDepartments } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useLanguage } from "@/components/i18n";
import ConfirmDialog from "@/components/ConfirmDialog";

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

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [userRole, setUserRole] = useState<"admin" | "manager" | "employee" | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Filter state (stores department ID as string or "ALL")
  const [department, setDepartment] = useState(allValue);
  
  // File upload state
  const [title, setTitle] = useState("");
  const [selectedDept, setSelectedDept] = useState(""); // Stores ID
  const [file, setFile] = useState<File | null>(null);
  
  // Confirmation state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const canManageDocuments = userRole === "admin" || userRole === "manager";

  useEffect(() => {
    const user = getStoredUser();
    setUserRole(user?.role ?? null);

    let active = true;
    Promise.all([getDocuments(), getDepartments()]).then(([docsData, deptsData]) => {
      if (active) {
        setDocuments(docsData);
        setDepartments(deptsData);
      }
    }).catch(console.warn);
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return documents.filter((item) => {
      if (department === allValue) return true;
      
      // item.department is number (ID)
      return item.department.toString() === department;
    });
  }, [documents, department]);

  const handleCreate = (e: FormEvent) => {
      e.preventDefault();
      if (!file || !title || !selectedDept) return;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("department", selectedDept); // Sends ID
      formData.append("file", file);

      createDocument(formData).then((newDoc) => {
          setDocuments(prev => [newDoc, ...prev]);
          setTitle("");
          setFile(null);
          setSelectedDept("");
          // Reset file input visually if needed, but managing state is key
          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
      }).catch(err => {
          alert(t("documents.upload.error"));
          console.warn(err);
      });
  };

  const handleDelete = (id: number) => {
      setDeletingId(id);
  };

  const confirmDelete = () => {
      if (deletingId === null) return;
      deleteDocument(deletingId)
        .then(() => {
            setDocuments(prev => prev.filter(d => d.id !== deletingId));
            setDeletingId(null);
        })
        .catch(err => {
            alert(t("documents.delete.error"));
          console.warn(err);
            setDeletingId(null);
        });
  };

  // Helper to get department name from ID
  const getDeptName = (id: number | Department) => {
      if (typeof id === 'object') return id.name;
      const d = departments.find(dep => dep.id === id);
      return d ? d.name : t("departments.unknown");
  };

  return (
    <div className="space-y-8">
      <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("documents.label")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {t("documents.title")}
          </h1>
           <p className="mt-1 text-sm text-slate-600">
            {t("documents.subtitle")}
          </p>
      </header>

      {/* Upload Form */}
      {canManageDocuments && (
      <section className="animated-border rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
         <h2 className="text-sm font-semibold text-slate-900 mb-4">{t("documents.new.title")}</h2>
         <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("documents.form.title")}</label>
                <input 
                   value={title}
                   onChange={e => setTitle(e.target.value)}
                   className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                   placeholder={t("documents.form.title.placeholder")}
                   required
                />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("documents.form.department")}</label>
                <select 
                   value={selectedDept}
                   onChange={e => setSelectedDept(e.target.value)}
                   className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                   required
                >
                    <option value="">{t("common.select.department")}</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option> 
                    ))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("documents.form.file")}</label>
                <input 
                   id="file-upload"
                   type="file"
                   onChange={e => setFile(e.target.files?.[0] || null)}
                   className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                   required
                />
             </div>
             <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end">
                 <button
                   type="submit"
                   className="animated-border rounded-xl bg-slate-900 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                 >
                   {t("documents.upload")}
                 </button>
             </div>
         </form>
      </section>
      )}

      {/* Filters */}
      <section className="flex flex-wrap gap-2">
          <FilterPill
            label={t("departments.all")}
            active={department === allValue}
            onClick={() => setDepartment(allValue)}
          />
          {departments.map(d => (
              <FilterPill
                 key={d.id}
                 label={d.name}
                 active={department === d.id.toString()}
                 onClick={() => setDepartment(d.id.toString())}
              />
          ))}
      </section>

      {/* List */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="animated-border group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                   {/* File Icon */}
                   <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                   </div>
                   <h3 className="mt-4 font-semibold text-slate-900 break-words">{item.title}</h3>
                </div>
                {canManageDocuments && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-rose-500"
                  title={t("common.delete")}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                   </svg>
                </button>
                )}
              </div>
              
              <div className="mt-4 flex flex-col gap-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                      <span>{t("common.owner")}</span>
                      <span className="font-medium text-slate-700">{item.author_name || `User #${item.author}`}</span>
                  </div>
                   <div className="flex justify-between">
                      <span>{t("common.dept")}</span>
                      <span className="font-medium text-slate-700">{getDeptName(item.department)}</span>
                  </div>
                  <div className="flex justify-between">
                     <span>{t("common.version")}</span>
                     <span>{item.current_version}</span>
                  </div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100">
               <a 
                 href={item.file} // Assumes full URL from API or handled by buildUrl
                 target="_blank"
                 rel="noopener noreferrer"
                 className="block w-full text-center rounded-lg bg-slate-50 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
               >
                 {t("common.download")}
               </a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-slate-500">
            {t("documents.empty")}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={deletingId !== null}
        message={t("documents.delete.confirm")}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
        isDestructive
      />
    </div>
  );
}
