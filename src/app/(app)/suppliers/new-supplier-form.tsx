"use client";

import { useActionState, useRef, useEffect } from "react";
import { createSupplierAction, type FormState } from "@/lib/actions/suppliers";
import { SubmitButton } from "@/components/submit-button";
import { FormError, FormSuccess } from "@/components/form-error";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function NewSupplierForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createSupplierAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Add supplier</h2>
      <FormError message={state?.error} />
      <FormSuccess message={state?.success} />
      <div>
        <label className={labelClass} htmlFor="name">Company name</label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="contactPerson">Contact person</label>
        <input id="contactPerson" name="contactPerson" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="phone">Phone</label>
        <input id="phone" name="phone" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="address">Address</label>
        <textarea id="address" name="address" rows={2} className={inputClass} />
      </div>
      <SubmitButton pendingText="Adding…" className="w-full">Add supplier</SubmitButton>
    </form>
  );
}
