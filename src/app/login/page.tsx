import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold text-white">
            SS
          </span>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-white">Shoe Store</h1>
            <p className="text-sm text-slate-400">Business management console</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <LoginForm next={next ?? "/dashboard"} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Default admin: admin@shoestore.test / admin123 (change after first login)
        </p>
      </div>
    </div>
  );
}
