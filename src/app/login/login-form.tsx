"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { FormError } from "@/components/form-error";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          placeholder="you@shoestore.test"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          placeholder="••••••••"
        />
      </div>
      <FormError message={state?.error} />
      <SubmitButton className="w-full" pendingText="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
