"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/pos", label: "Point of Sale", icon: "cart" },
  { href: "/inventory", label: "Inventory", icon: "box" },
  { href: "/orders", label: "Orders", icon: "receipt" },
  { href: "/customers", label: "Customers", icon: "users" },
  { href: "/suppliers", label: "Suppliers", icon: "truck" },
  { href: "/reports", label: "Reports", icon: "chart" },
] as const;

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 15h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
  ),
  cart: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
    />
  ),
  box: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8 12 3 3 8l9 5 9-5Zm0 0v8l-9 5m0-8v8m0-8L3 8m0 0v8l9 5"
    />
  ),
  receipt: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm2 5h8M8 11h8M8 14h5"
    />
  ),
  users: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 21a7 7 0 0 1 14 0M17 11a3.5 3.5 0 0 1 4 3.46M21 21a6 6 0 0 0-4.5-5.8"
    />
  ),
  truck: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6ZM6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
    />
  ),
  chart: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10m6 10V4m6 16v-7" />
  ),
  staff: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
    />
  ),
};

export function Sidebar({ role }: { role: "admin" | "staff" }) {
  const pathname = usePathname();
  const items = role === "admin" ? [...NAV_ITEMS, { href: "/staff", label: "Staff", icon: "staff" } as const] : NAV_ITEMS;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-200 md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
          SS
        </span>
        <span className="text-sm font-semibold tracking-wide text-white">Shoe Store</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active ? "bg-indigo-500/15 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-4 w-4 shrink-0"
              >
                {ICONS[item.icon]}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 px-4 py-4 text-xs text-slate-500">
        Shoe Store Business Software
      </div>
    </aside>
  );
}
