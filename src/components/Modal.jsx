import React, { useEffect } from "react";
import { cx } from "../lib/utils";

export default function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/30 backdrop-blur-sm"
      />
      <div className="relative mx-auto mt-16 w-[min(720px,calc(100%-2rem))]">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-soft">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-zinc-900">{title}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cx(
                "rounded-xl border px-3 py-2 text-sm",
                "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              )}
            >
              Close
            </button>
          </div>
          <div className="px-5 py-4 text-sm leading-6 text-zinc-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
