import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { RevenueChart } from "@/components/revenue-chart";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  getDashboardStats,
  getLowStockVariants,
  getRecentOrders,
  getRevenueTrend,
  getTopProducts,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);

  const [stats, trend, topProducts, lowStock, recentOrders] = await Promise.all([
    getDashboardStats(),
    getRevenueTrend(14),
    getTopProducts(5, since30),
    getLowStockVariants(6),
    getRecentOrders(6),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Store performance at a glance.</p>
        </div>
        <Link
          href="/pos"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          New sale
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenue)} hint={`${stats.totalOrders} orders all-time`} />
        <StatCard label="Today's revenue" value={formatCurrency(stats.todayRevenue)} hint={`${stats.todayOrders} orders today`} tone="positive" />
        <StatCard label="Active products" value={String(stats.productCount)} hint={`${stats.customerCount} customers`} />
        <StatCard
          label="Low stock items"
          value={String(stats.lowStockCount)}
          hint={stats.lowStockCount ? "Needs restocking" : "All stocked up"}
          tone={stats.lowStockCount ? "warning" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Revenue — last 14 days</h2>
          </div>
          <RevenueChart data={trend} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Best sellers (30 days)</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.productName} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-[11px] font-semibold text-slate-500">
                      {i + 1}
                    </span>
                    <span className="truncate text-slate-700">{p.productName}</span>
                  </div>
                  <span className="shrink-0 text-slate-400">{p.unitsSold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent orders</h2>
            <Link href="/orders" className="text-xs font-medium text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400">No orders yet — head to Point of Sale to ring up your first sale.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between py-2.5 text-sm hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-800">{order.orderNumber}</p>
                    <p className="text-xs text-slate-400">
                      {order.customer?.name ?? "Walk-in"} &middot; {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCurrency(order.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Low stock</h2>
            <Link href="/inventory" className="text-xs font-medium text-indigo-600 hover:underline">
              View inventory
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400">Everything is above its reorder level.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStock.map((item) => (
                <Link
                  key={item.variantId}
                  href={`/inventory/${item.productId}`}
                  className="flex items-center justify-between py-2.5 text-sm hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-800">{item.productName}</p>
                    <p className="text-xs text-slate-400">
                      {item.size} &middot; {item.color} &middot; {item.sku}
                    </p>
                  </div>
                  <span className="font-semibold text-amber-600">{item.stockQuantity} left</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
