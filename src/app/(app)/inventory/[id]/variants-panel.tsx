"use client";

import { useActionState, useState } from "react";
import {
  addVariantAction,
  adjustStockAction,
  deleteVariantAction,
  type FormState,
} from "@/lib/actions/products";
import { SubmitButton } from "@/components/submit-button";
import { FormError, FormSuccess } from "@/components/form-error";
import { cn } from "@/lib/format";
import type { productVariants } from "@/db/schema";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-slate-500 focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

type Variant = typeof productVariants.$inferSelect;

export function VariantsPanel({ productId, variants }: { productId: number; variants: Variant[] }) {
  const addAction = addVariantAction.bind(null, productId);
  const [state, formAction] = useActionState<FormState, FormData>(addAction, undefined);
  const [showAdd, setShowAdd] = useState(variants.length === 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Variants (size / color / SKU)</h2>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="text-xs font-medium text-indigo-600 hover:underline"
        >
          {showAdd ? "Hide form" : "+ Add variant"}
        </button>
      </div>

      {showAdd ? (
        <form action={formAction} className="mb-5 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <FormError message={state?.error} />
          <FormSuccess message={state?.success} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <label className={labelClass}>Size</label>
              <input name="size" required className={inputClass} placeholder="10" />
            </div>
            <div>
              <label className={labelClass}>Color</label>
              <input name="color" className={inputClass} placeholder="Black" defaultValue="Black" />
            </div>
            <div>
              <label className={labelClass}>SKU</label>
              <input name="sku" required className={inputClass} placeholder="SKU-10-BLK" />
            </div>
            <div>
              <label className={labelClass}>Stock</label>
              <input name="stockQuantity" type="number" min="0" defaultValue={0} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Reorder at</label>
              <input name="reorderLevel" type="number" min="0" defaultValue={5} className={inputClass} />
            </div>
          </div>
          <SubmitButton pendingText="Adding…" className="text-xs">Add variant</SubmitButton>
        </form>
      ) : null}

      {variants.length === 0 ? (
        <p className="text-sm text-slate-400">No variants yet — add a size to start tracking stock.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Size</th>
                <th className="px-3 py-2 font-medium">Color</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Stock</th>
                <th className="px-3 py-2 font-medium">Adjust</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((variant) => {
                const low = variant.stockQuantity <= variant.reorderLevel;
                return (
                  <tr key={variant.id}>
                    <td className="px-3 py-2 font-medium text-slate-800">{variant.size}</td>
                    <td className="px-3 py-2 text-slate-600">{variant.color}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{variant.sku}</td>
                    <td className="px-3 py-2">
                      <span className={cn("font-semibold", low ? "text-amber-600" : "text-slate-700")}>
                        {variant.stockQuantity}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">/ {variant.reorderLevel} min</span>
                    </td>
                    <td className="px-3 py-2">
                      <form action={adjustStockAction.bind(null, productId)} className="flex items-center gap-1">
                        <input type="hidden" name="variantId" value={variant.id} />
                        <input
                          name="delta"
                          type="number"
                          defaultValue={1}
                          title="Positive to restock, negative to remove"
                          className="h-7 w-16 rounded border border-slate-300 px-1 text-center text-xs"
                        />
                        <button
                          type="submit"
                          className="h-7 rounded border border-slate-300 px-2 text-xs text-slate-600 hover:bg-slate-100"
                        >
                          Apply
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <form action={deleteVariantAction.bind(null, productId, variant.id)}>
                        <button className="text-xs font-medium text-red-500 hover:underline">Remove</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
