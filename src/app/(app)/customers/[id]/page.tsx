import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteCustomerAction } from "@/lib/actions/customers";
import { EditCustomerForm } from "./edit-customer-form";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = Number(id);
  if (!Number.isFinite(customerId)) notFound();

  const customer = await db.query.customers.findFirst({ where: eq(customers.id, customerId) });
  if (!customer) notFound();

  const customerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));

  const lifetimeSpend = customerOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{customer.name}</h1>
          <p className="text-sm text-slate-500">
            {customerOrders.length} orders &middot; {formatCurrency(lifetimeSpend)} lifetime spend
          </p>
        </div>
        <form action={deleteCustomerAction.bind(null, customer.id)}>
          <button className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
            Delete customer
          </button>
        </form>
      </div>

      <EditCustomerForm customer={customer} />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Order history</h2>
        </div>
        {customerOrders.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">No orders yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {customerOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between p-4 text-sm hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{order.orderNumber}</p>
                  <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(order.total)}</p>
                  <p className={`text-xs ${order.status === "refunded" ? "text-red-500" : "text-emerald-600"}`}>
                    {order.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
