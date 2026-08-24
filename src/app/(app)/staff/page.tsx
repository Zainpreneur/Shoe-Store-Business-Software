import { desc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/require-user";
import { deleteUserAction } from "@/lib/actions/users";
import { formatDateShort } from "@/lib/format";
import { NewStaffForm } from "./new-staff-form";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const session = await requireAdmin();
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Staff accounts</h1>
        <p className="text-sm text-slate-500">Manage who can sign in to the console.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="divide-y divide-slate-100">
            {allUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium text-slate-900">
                    {u.name} {u.id === session.userId ? <span className="text-xs text-slate-400">(you)</span> : null}
                  </p>
                  <p className="text-xs text-slate-400">
                    {u.email} &middot; <span className="capitalize">{u.role}</span> &middot; joined {formatDateShort(u.createdAt)}
                  </p>
                </div>
                {u.id !== session.userId ? (
                  <form action={deleteUserAction.bind(null, u.id)}>
                    <button className="text-xs font-medium text-red-500 hover:underline">Remove</button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <NewStaffForm />
      </div>
    </div>
  );
}
