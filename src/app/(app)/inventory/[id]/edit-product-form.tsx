"use client";

import { useActionState } from "react";
import { updateProductAction, type FormState } from "@/lib/actions/products";
import { SubmitButton } from "@/components/submit-button";
import { FormError, FormSuccess } from "@/components/form-error";
import type { products } from "@/db/schema";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function EditProductForm({
  product,
  suppliers,
}: {
  product: typeof products.$inferSelect;
  suppliers: Array<{ id: number; name: string }>;
}) {
  const action = updateProductAction.bind(null, product.id);
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Product details</h2>
      <FormError message={state?.error} />
      <FormSuccess message={state?.success} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="name">Product name</label>
          <input id="name" name="name" required defaultValue={product.name} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="brand">Brand</label>
          <input id="brand" name="brand" defaultValue={product.brand ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="category">Category</label>
          <input id="category" name="category" defaultValue={product.category} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="costPrice">Cost price</label>
          <input id="costPrice" name="costPrice" type="number" min="0" step="0.01" defaultValue={product.costPrice} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="sellingPrice">Selling price</label>
          <input id="sellingPrice" name="sellingPrice" type="number" min="0" step="0.01" defaultValue={product.sellingPrice} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="imageUrl">Image URL</label>
          <input id="imageUrl" name="imageUrl" defaultValue={product.imageUrl ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="supplierId">Supplier</label>
          <select id="supplierId" name="supplierId" defaultValue={product.supplierId ?? ""} className={inputClass}>
            <option value="">— None —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} defaultValue={product.description ?? ""} className={inputClass} />
        </div>
      </div>
      <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
    </form>
  );
}
