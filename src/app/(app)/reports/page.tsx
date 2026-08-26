import { StatCard } from "@/components/stat-card";
import { RevenueChart } from "@/components/revenue-chart";
import { formatCurrency, formatDateShort } from "@/lib/format";
import { getRevenueTrend, getSalesForRange, getStockValuation, getTopProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

function parseRangeDays(value?: string) {
  const num = Number(value);
  if ([7, 14, 30, 90].includes(num)) return num;
  return 30;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseRangeDays(range);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const end = new Date();

  const [trend, topProducts, stockValuation, salesInRange] = await Promise.all([
    getRevenueTrend(days),
    getTopProducts(10, start),
    getStockValuation(),
    getSalesForRange(start, end),
  ]);

  const revenue = salesInRange.reduce((sum, o) => sum + Number(o.total), 0);
  const unitsSold = salesInRange.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const avgOrderValue = salesInRange.length ? revenue / salesInRange.length : 0;

  const ranges = [
    { label: "7 days", value: 7 },
    { label: "14 days", value: 14 },
    { label: "30 days", value: 30 },
    { label: "90 days", value: 90 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">
            {formatDateShort(start)} — {formatDateShort(end)}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {ranges.map((r) => (
            <a
              key={r.value}
              href={`/reports?range=${r.value}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                days === r.value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {r.label}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(revenue)} hint={`${salesInRange.length} orders`} />
        <StatCard label="Units sold" value={String(unitsSold)} />
        <StatCard label="Avg. order value" value={formatCurrency(avgOrderValue)} />
        <StatCard label="Stock retail value" value={formatCurrency(stockValuation.retailValue)} hint={`${stockValuation.units} units on hand`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Revenue trend</h2>
          <RevenueChart data={trend} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Top products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">No sales in this period.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.productName} className="flex items-center justify-between text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-[11px] font-semibold text-slate-500">
                      {i + 1}
                    </span>
                    <span className="truncate text-slate-700">{p.productName}</span>
                  </div>
                  <span className="shrink-0 font-medium text-slate-900">{formatCurrency(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Inventory valuation</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Units on hand</p>
            <p className="text-lg font-semibold text-slate-900">{stockValuation.units}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Cost value</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(stockValuation.costValue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Retail value</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(stockValuation.retailValue)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
