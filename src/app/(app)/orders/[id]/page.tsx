import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { db } from "@/db";
import { refundOrderAction } from "@/lib/actions/orders";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();

  const order = await db.query.orders.findFirst({
    where: (o, { eq }) => eq(o.id, orderId),
    with: { customer: true, items: true, createdByUser: true },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              order.status === "refunded" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {order.status}
          </span>
          {order.status === "completed" ? (
            <form action={refundOrderAction.bind(null, order.id)}>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Refund order
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Customer</p>
          {order.customer ? (
            <Link href={`/customers/${order.customer.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
              {order.customer.name}
            </Link>
          ) : (
            <p className="text-sm text-slate-700">Walk-in customer</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Payment</p>
          <p className="text-sm capitalize text-slate-700">{order.paymentMethod}</p>
          {order.createdByUser ? <p className="text-xs text-slate-400">Sold by {order.createdByUser.name}</p> : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Items</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium text-slate-800">{item.productName}</p>
                <p className="text-xs text-slate-400">
                  Size {item.size} &middot; {item.color} &middot; {item.sku} &middot; Qty {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-slate-900">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1 border-t border-slate-100 p-4 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Discount</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
