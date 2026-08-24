# Shoe Store Business Software

A full-stack business management console for a shoe store: inventory (with
size/color variants), a point-of-sale checkout, customer records, order
history, and sales/inventory reporting.

**Stack:** Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS
· Drizzle ORM · PostgreSQL · Recharts · JWT session auth (`jose` + `bcryptjs`).

## Features

- **Inventory** — products with size/color/SKU variants, per-variant stock
  levels and reorder thresholds, low-stock indicators, supplier assignment,
  manual stock adjustments with an audit trail (`stock_movements`).
- **Point of Sale** — searchable catalog, cart with live stock limits,
  walk-in or existing customer, discounts, payment method, one-click
  checkout that atomically decrements stock and records the sale.
- **Customers** — contact records with full order history and lifetime
  spend.
- **Orders** — order list and receipt-style detail view, with refunds that
  restock items.
- **Suppliers** — simple supplier directory linked to products.
- **Reports** — revenue trend chart, best sellers, average order value, and
  inventory valuation (cost vs. retail), filterable by date range.
- **Staff accounts** — admin/staff roles; admins manage who can sign in.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — a PostgreSQL connection string.
- `SESSION_SECRET` — a long random string (e.g. `openssl rand -hex 32`).

A `docker-compose.yml` is included if you want a local Postgres instance:

```bash
docker compose up -d
```

### 3. Create the schema and seed demo data

```bash
npm run db:push   # creates tables from src/db/schema.ts
npm run db:seed   # demo products, customers, supplier, and staff accounts
```

Seeded logins:

- **Admin:** `admin@shoestore.test` / `admin123`
- **Staff:** `staff@shoestore.test` / `staff123`

Change these passwords (or remove the accounts) before using this in
production — create a new admin from the Staff page and delete the seed
account.

### 4. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`. You'll be redirected to `/login`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Lint the codebase |
| `npm run db:generate` | Generate SQL migration files from the schema |
| `npm run db:push` | Push the schema straight to the database (dev) |
| `npm run db:studio` | Open Drizzle Studio to browse the database |
| `npm run db:seed` | Seed demo data |

## Project structure

```
src/
  app/
    login/                 Sign-in page
    (app)/                 Authenticated shell (sidebar + topbar)
      dashboard/           KPIs, revenue chart, recent orders, low stock
      pos/                 Point of sale
      inventory/           Product & variant management
      orders/              Order list + receipt detail
      customers/           Customer list + detail/order history
      suppliers/           Supplier directory
      reports/             Sales & inventory reports
      staff/               Admin-only staff account management
  components/               Shared UI (sidebar, forms, chart, stat cards)
  db/
    schema.ts               Drizzle schema (products, variants, orders, …)
    seed.ts                 Demo data seed script
  lib/
    actions/                Server Actions (mutations) per domain
    queries.ts               Read queries for pages
    auth.ts, require-user.ts Session/cookie auth helpers
  proxy.ts                   Route protection (Next.js 16 "proxy" convention,
                              formerly middleware.ts)
```

Authentication is a signed JWT stored in an httpOnly cookie; `src/proxy.ts`
redirects any unauthenticated request to `/login`. All writes go through
Server Actions in `src/lib/actions/*`, which re-check the session
server-side before touching the database — the client never talks to the
database directly.

## Deploying

Point `DATABASE_URL` at a managed Postgres instance (e.g. Supabase, Neon,
RDS), run `npm run db:push` (or generate/apply migrations with
`db:generate`) against it, set a strong `SESSION_SECRET`, then `npm run
build && npm run start`, or deploy to any Node-compatible host (Vercel,
Railway, Fly.io, etc.).
