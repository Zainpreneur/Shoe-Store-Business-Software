"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/format";

export function SubmitButton({
  children,
  className,
  pendingText,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-700",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };

  return (
    <button type="submit" disabled={pending} className={cn(base, variants[variant], className)}>
      {pending ? pendingText ?? "Saving…" : children}
    </button>
  );
}
