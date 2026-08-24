import { logoutAction } from "@/lib/actions/auth";
import { MobileNav } from "@/components/mobile-nav";

export function Topbar({
  name,
  role,
  title,
}: {
  name: string;
  role: "admin" | "staff";
  title?: string;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      <div className="flex items-center gap-3">
        <MobileNav role={role} />
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-slate-900">{name}</p>
          <p className="text-xs capitalize text-slate-400">{role}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
