import { requireUser } from "@/lib/require-user";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();

  return (
    <div className="flex h-full min-h-screen bg-slate-50">
      <Sidebar role={session.role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar name={session.name} role={session.role} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
