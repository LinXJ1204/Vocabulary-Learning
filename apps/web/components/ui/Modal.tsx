"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { cn } from "../../lib/cn";

export function Modal(props: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const { open, onClose, title, description, children, footer } = props;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "w-full max-w-md rounded-lg border border-border bg-white shadow-lg"
          )}
        >
          {(title || description) && (
            <div className="border-b border-border px-5 py-4">
              {title ? (
                <div className="text-base font-semibold tracking-tight">{title}</div>
              ) : null}
              {description ? (
                <div className="mt-1 text-sm text-mutedForeground">{description}</div>
              ) : null}
            </div>
          )}

          {children ? <div className="px-5 py-4">{children}</div> : null}

          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

