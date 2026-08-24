import { cn } from "@/lib/format";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning" | "positive";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight",
          tone === "warning" && "text-amber-600",
          tone === "positive" && "text-emerald-600",
          tone === "default" && "text-slate-900"
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
