import { getAllSuppliers } from "@/lib/queries";
import { deleteSupplierAction } from "@/lib/actions/suppliers";
import { NewSupplierForm } from "./new-supplier-form";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await getAllSuppliers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Suppliers</h1>
        <p className="text-sm text-slate-500">{suppliers.length} suppliers on file.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="divide-y divide-slate-100">
            {suppliers.length === 0 ? (
              <p className="p-6 text-sm text-slate-400">No suppliers yet — add your first one.</p>
            ) : (
              suppliers.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-400">
                      {s.contactPerson ? `${s.contactPerson} · ` : ""}
                      {s.email || s.phone || "No contact info"}
                    </p>
                  </div>
                  <form action={deleteSupplierAction.bind(null, s.id)}>
                    <button className="text-xs font-medium text-red-500 hover:underline">Remove</button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
        <NewSupplierForm />
      </div>
    </div>
  );
}
