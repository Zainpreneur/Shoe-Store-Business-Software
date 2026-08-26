"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createProductAction, type FormState } from "@/lib/actions/products";
import { SubmitButton } from "@/components/submit-button";
import { FormError } from "@/components/form-error";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function NewProductForm({ suppliers }: { suppliers: Array<{ id: number; name: string }> }) {
  const [state, formAction] = useActionState<FormState, FormData>(createProductAction, undefined);

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="name">Product name</label>
          <input id="name" name="name" required className={inputClass} placeholder="Trail Runner X2" />
        </div>
        <div>
          <label className={labelClass} htmlFor="brand">Brand</label>
          <input id="brand" name="brand" className={inputClass} placeholder="Summit" />
        </div>
        <div>
          <label className={labelClass} htmlFor="category">Category</label>
          <input id="category" name="category" className={inputClass} placeholder="Running" defaultValue="Running" />
        </div>
        <div>
          <label className={labelClass} htmlFor="costPrice">Cost price</label>
          <input id="costPrice" name="costPrice" type="number" min="0" step="0.01" required className={inputClass} placeholder="35.00" />
        </div>
        <div>
          <label className={labelClass} htmlFor="sellingPrice">Selling price</label>
          <input id="sellingPrice" name="sellingPrice" type="number" min="0" step="0.01" required className={inputClass} placeholder="79.99" />
        </div>
        <div>
          <label className={labelClass} htmlFor="imageUrl">Image URL (optional)</label>
          <input id="imageUrl" name="imageUrl" className={inputClass} placeholder="https://…" />
        </div>
        <div>
          <label className={labelClass} htmlFor="supplierId">Supplier (optional)</label>
          <select id="supplierId" name="supplierId" className={inputClass} defaultValue="">
            <option value="">— None —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} className={inputClass} placeholder="Lightweight trail running shoe with grippy outsole." />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h2 className="text-sm font-semibold text-slate-900">First variant</h2>
        <p className="mb-3 text-xs text-slate-500">Add more sizes and colors after creating the product.</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass} htmlFor="size">Size</label>
            <input id="size" name="size" required className={inputClass} placeholder="9" />
          </div>
          <div>
            <label className={labelClass} htmlFor="color">Color</label>
            <input id="color" name="color" className={inputClass} placeholder="Black" defaultValue="Black" />
          </div>
          <div>
            <label className={labelClass} htmlFor="sku">SKU</label>
            <input id="sku" name="sku" required className={inputClass} placeholder="TRX2-BLK-9" />
          </div>
          <div>
            <label className={labelClass} htmlFor="stockQuantity">Initial stock</label>
            <input id="stockQuantity" name="stockQuantity" type="number" min="0" defaultValue={0} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="reorderLevel">Reorder level</label>
            <input id="reorderLevel" name="reorderLevel" type="number" min="0" defaultValue={5} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pendingText="Creating…">Create product</SubmitButton>
        <Link href="/inventory" className="text-sm text-slate-500 hover:underline">Cancel</Link>
      </div>
    </form>
  );
}
