"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./i18n";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  showCancel?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  showCancel = true,
}: ConfirmDialogProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setVisible(false), 200);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
        onClick={onCancel}
      />

      {/* Modal */}
      <div 
        className={`relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-200 ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <div className="flex flex-col items-center text-center">
            {isDestructive ? (
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>
            ) : (
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                </div>
            )}
            
          <h3 className="text-lg font-semibold text-slate-900">
            {title || t("common.confirm")}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {message}
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {showCancel && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
            >
              {cancelLabel || t("common.cancel")}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDestructive 
                ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500" 
                : "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500"
            }`}
          >
            {confirmLabel || t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}