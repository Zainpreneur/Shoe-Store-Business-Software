import Link from "next/link";
import { getAllProductsWithVariants } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import { InventoryTable } from "./inventory-table";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await getAllProductsWithVariants();

  const totalUnits = products.reduce(
    (sum, p) => sum + p.variants.reduce((s, v) => s + v.stockQuantity, 0),
    0
  );
  const lowStockCount = products.reduce(
    (sum, p) => sum + p.variants.filter((v) => v.stockQuantity <= v.reorderLevel).length,
    0
  );
  const retailValue = products.reduce(
    (sum, p) => sum + p.variants.reduce((s, v) => s + v.stockQuantity * Number(p.sellingPrice), 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">
            {products.length} products &middot; {totalUnits} units in stock &middot; {formatCurrency(retailValue)} retail value
            {lowStockCount ? ` · ${lowStockCount} low stock` : ""}
          </p>
        </div>
        <Link
          href="/inventory/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Add product
        </Link>
      </div>

      <InventoryTable products={products} />
    </div>
  );
}
