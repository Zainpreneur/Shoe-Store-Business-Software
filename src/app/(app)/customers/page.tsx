import Link from "next/link";
import { getAllCustomers } from "@/lib/queries";
import { NewCustomerForm } from "./new-customer-form";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getAllCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">{customers.length} customers on file.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="divide-y divide-slate-100">
            {customers.length === 0 ? (
              <p className="p-6 text-sm text-slate-400">No customers yet — add your first one.</p>
            ) : (
              customers.map((c) => (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  className="flex items-center justify-between p-4 text-sm hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.email || c.phone || "No contact info"}</p>
                  </div>
                  <span className="text-xs font-medium text-indigo-600">View</span>
                </Link>
              ))
            )}
          </div>
        </div>
        <NewCustomerForm />
      </div>
    </div>
  );
}
