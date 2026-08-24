"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pos", label: "Point of Sale" },
  { href: "/inventory", label: "Inventory" },
  { href: "/orders", label: "Orders" },
  { href: "/customers", label: "Customers" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/reports", label: "Reports" },
];

export function MobileNav({ role }: { role: "admin" | "staff" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = role === "admin" ? [...NAV_ITEMS, { href: "/staff", label: "Staff" }] : NAV_ITEMS;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle navigation"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="h-full w-64 space-y-1 overflow-y-auto bg-slate-900 p-3 text-slate-200">
            <div className="mb-3 px-3 py-2 text-sm font-semibold text-white">Shoe Store</div>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === item.href ? "bg-indigo-500/15 text-white" : "text-slate-400"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex-1 bg-black/30" />
        </div>
      ) : null}
    </div>
  );
}
