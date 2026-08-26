"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { getAllProductsWithVariants } from "@/lib/queries";

type Product = Awaited<ReturnType<typeof getAllProductsWithVariants>>[number];

export function InventoryTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.brand?.toLowerCase().includes(q)) return true;
      if (p.category.toLowerCase().includes(q)) return true;
      return p.variants.some((v) => v.sku.toLowerCase().includes(q));
    });
  }, [products, query]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, brand, category, or SKU…"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Variants</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((product) => {
              const stock = product.variants.reduce((s, v) => s + v.stockQuantity, 0);
              const lowStock = product.variants.some((v) => v.stockQuantity <= v.reorderLevel);
              return (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/inventory/${product.id}`} className="font-medium text-slate-900 hover:underline">
                      {product.name}
                    </Link>
                    {product.brand ? <p className="text-xs text-slate-400">{product.brand}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{product.category}</td>
                  <td className="px-4 py-3 text-slate-600">{formatCurrency(product.sellingPrice)}</td>
                  <td className="px-4 py-3 text-slate-600">{product.variants.length}</td>
                  <td className="px-4 py-3">
                    <span className={lowStock ? "font-semibold text-amber-600" : "text-slate-600"}>{stock}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/inventory/${product.id}`} className="text-xs font-medium text-indigo-600 hover:underline">
                      Manage
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  No products match your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
