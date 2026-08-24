"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSaleAction, type CreateSaleResult } from "@/lib/actions/orders";
import { formatCurrency } from "@/lib/format";
import type { getAllCustomers, getPosCatalog } from "@/lib/queries";

type CatalogItem = Awaited<ReturnType<typeof getPosCatalog>>[number];
type Customer = Awaited<ReturnType<typeof getAllCustomers>>[number];

type CartLine = { variantId: number; quantity: number };

export function PosClient({ catalog, customers }: { catalog: CatalogItem[]; customers: Customer[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<number, CartLine>>({});
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile" | "other">("cash");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ orderNumber: string; total: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const catalogById = useMemo(() => new Map(catalog.map((c) => [c.variantId, c])), [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (item) =>
        item.productName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.size.toLowerCase().includes(q)
    );
  }, [catalog, query]);

  const cartLines = Object.values(cart);
  const subtotal = cartLines.reduce((sum, line) => {
    const item = catalogById.get(line.variantId);
    return sum + (item ? Number(item.sellingPrice) * line.quantity : 0);
  }, 0);
  const safeDiscount = Math.min(Math.max(discount || 0, 0), subtotal);
  const total = subtotal - safeDiscount;

  function addToCart(item: CatalogItem) {
    setReceipt(null);
    setCart((prev) => {
      const existing = prev[item.variantId];
      const nextQty = (existing?.quantity ?? 0) + 1;
      if (nextQty > item.stockQuantity) return prev;
      return { ...prev, [item.variantId]: { variantId: item.variantId, quantity: nextQty } };
    });
  }

  function setQuantity(variantId: number, quantity: number) {
    setCart((prev) => {
      const item = catalogById.get(variantId);
      if (!item) return prev;
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[variantId];
        return next;
      }
      return { ...prev, [variantId]: { variantId, quantity: Math.min(quantity, item.stockQuantity) } };
    });
  }

  function removeFromCart(variantId: number) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  }

  function checkout() {
    setError(null);
    startTransition(async () => {
      const result: CreateSaleResult = await createSaleAction({
        customerId: customerId ? Number(customerId) : null,
        paymentMethod,
        discount: safeDiscount,
        items: cartLines,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setReceipt({ orderNumber: result.orderNumber!, total });
      setCart({});
      setDiscount(0);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKU, or size…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="grid max-h-[70vh] grid-cols-1 gap-2 overflow-y-auto p-4 sm:grid-cols-2">
          {filtered.map((item) => {
            const inCartQty = cart[item.variantId]?.quantity ?? 0;
            const outOfStock = item.stockQuantity <= 0;
            return (
              <button
                key={item.variantId}
                type="button"
                disabled={outOfStock || inCartQty >= item.stockQuantity}
                onClick={() => addToCart(item)}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-left text-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{item.productName}</p>
                  <p className="text-xs text-slate-400">
                    Size {item.size} &middot; {item.color} &middot; {item.stockQuantity} in stock
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(item.sellingPrice)}</p>
                  {inCartQty ? <p className="text-xs text-indigo-600">{inCartQty} in cart</p> : null}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <p className="col-span-full py-10 text-center text-sm text-slate-400">No matching products.</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Current sale</h2>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {cartLines.length === 0 ? (
            <p className="text-sm text-slate-400">Cart is empty. Tap a product to add it.</p>
          ) : (
            cartLines.map((line) => {
              const item = catalogById.get(line.variantId);
              if (!item) return null;
              return (
                <div key={line.variantId} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{item.productName}</p>
                    <p className="text-xs text-slate-400">Size {item.size} &middot; {item.color}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                      className="h-6 w-6 rounded border border-slate-300 text-slate-500 hover:bg-slate-100"
                    >
                      −
                    </button>
                    <span className="w-5 text-center">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                      disabled={line.quantity >= item.stockQuantity}
                      className="h-6 w-6 rounded border border-slate-300 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(line.variantId)}
                      className="ml-1 text-xs text-red-500 hover:underline"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-3 border-t border-slate-100 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
            >
              <option value="">Walk-in customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Payment</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Discount ($)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Discount</span>
              <span>-{formatCurrency(safeDiscount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p> : null}
          {receipt ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Sale {receipt.orderNumber} completed — {formatCurrency(receipt.total)}
            </p>
          ) : null}

          <button
            type="button"
            disabled={cartLines.length === 0 || isPending}
            onClick={checkout}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Processing…" : `Charge ${formatCurrency(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
