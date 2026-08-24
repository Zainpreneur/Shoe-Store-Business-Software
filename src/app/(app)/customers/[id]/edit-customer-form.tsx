"use client";

import { useActionState } from "react";
import { updateCustomerAction, type FormState } from "@/lib/actions/customers";
import { SubmitButton } from "@/components/submit-button";
import { FormError, FormSuccess } from "@/components/form-error";
import type { customers } from "@/db/schema";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function EditCustomerForm({ customer }: { customer: typeof customers.$inferSelect }) {
  const action = updateCustomerAction.bind(null, customer.id);
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormError message={state?.error} />
        <FormSuccess message={state?.success} />
      </div>
      <div>
        <label className={labelClass} htmlFor="name">Name</label>
        <input id="name" name="name" required defaultValue={customer.name} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" defaultValue={customer.email ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="phone">Phone</label>
        <input id="phone" name="phone" defaultValue={customer.phone ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="address">Address</label>
        <input id="address" name="address" defaultValue={customer.address ?? ""} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}
