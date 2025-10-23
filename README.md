# Events App — Project Documentation

An opinionated Next.js application for managing events, tracking income and expenses per event, and recording stock purchases (price per kg, weight). The UI uses a compact, icon‑driven navbar with tooltips and active state, and each section includes friendly filters and totals.

## Tech Stack

- Framework: Next.js (App Router), React, TypeScript
- Styling: Tailwind CSS
- Data: Prisma ORM with MySQL (fallback to parameterized raw SQL when Prisma model is missing)
- Date utils: date-fns
- Font: Vercel Geist via next/font

## Features Overview

- Events
  - Create events with start/end datetime, basic details, and URL.
  - Past events include a ledger to add Income or Expense entries.
- Ledger (Per Event)
  - Type-aware Category input:
    - Expense → dropdown: Food, Fuel, Rent, Other
    - Income → dropdown: Mystery box, Online, Event
  - Amount is validated as non-negative (client and server side).
  - Delete entries via API.
- Company Expenses
  - Global list of expense entries across events with filters (date range, category), totals and per-category chips.
  - “Stock spent” total (sum of price_per_kg × weight for all stock).
- Company Income
  - Global list of income entries with filters (date range, category) and totals.
- Stock Management
  - Add stock records (price/kg in EUR, weight in kg, date, description, purchased_by, payment).
  - Purchased_by dropdown populated from env emails, with filters and totals (total weight + cost).
  - Client/server validation: price ≥ 0, weight > 0.
- Navbar
  - Professional inline SVG icons centered in the header, distinct colors for Income (emerald/up) and Expenses (rose/down).
  - Hover tooltips (single tooltip — native titles removed) and subtle hover scale.
  - Active route underline and color to show current page.

## Pages & Flows

- `/events` — Upcoming events list.
- `/create` — Create a new event.
  - Start/End inputs disallow past date-times and enforce start ≤ end.
- `/events/done/[id]/ledger` — Manage ledger for a past event.
  - Add Income/Expense entries with type-specific category input.
- `/expenses` — Company expense entries across events.
  - Filters: Start date, End date, Category (Food/Fuel/Rent/Other).
  - Totals and category chips; “Stock spent” total shown in header.
- `/income` — Company income entries across events.
  - Filters: Start date, End date, Category (Mystery box/Online/Event).
- `/stock` — Add stock and browse/filter stock records.
  - Filters: Start date, End date, Purchased by (from env), Payment method, Search in description.
  - Totals: total weight and total cost (EUR).

## Data Model (Prisma)

Datasource: MySQL (`DATABASE_URL`). Prisma models map to existing tables. Raw SQL fallbacks are used when Prisma hasn’t been regenerated.

- `Event` (maps to `events`)
  - id (BigInt, autoincrement), name, owner, optional description
  - venue/address fields, event_date, start_time, end_time, timezone, reservation_deadline_date
  - status, url_address
- `EventLedger` (maps to `event_ledger`)
  - id, event_id (FK), entry_type (income|expense), category, description
  - amount (Decimal), currency (EUR default), entry_date (Date), payment_method, counterparty
  - created_at, updated_at
- `Stock` (maps to `stock`)
  - id, price_per_kg (Decimal 10,2), weight_kg (Decimal 10,3), purchase_date (Date)
  - description, purchased_by (varchar 120), payment_method (varchar 50)
  - created_at, updated_at

## API Endpoints

- `POST /api/events`
  - Create a new event. Dates and times are normalized server-side.
- `GET /api/events/[id]/ledger`
  - List ledger entries for an event.
- `POST /api/events/[id]/ledger`
  - Create a ledger entry. Validates amount ≥ 0 (server-side).
- `DELETE /api/ledger/[id]`
  - Delete a ledger entry.
- `POST /api/stock`
  - Create a stock record. Validates price ≥ 0 and weight > 0.

All endpoints serialize BigInt as string in JSON responses. They use Prisma if models exist; otherwise they fall back to parameterized raw SQL for compatibility.

## Validation Rules

- Amounts (income/expense): non-negative on both client and server.
- Stock: price ≥ 0, weight > 0 on both client and server.
- Filters: Start date ≤ End date enforced with HTML min/max.
- Event creation: past date-times are disallowed (`min=now`), and end ≥ start is enforced on submit.

## Environment Variables

Create `.env` and `.env.local` files (see examples below).

- `DATABASE_URL` — MySQL connection string, e.g. `mysql://user:pass@localhost:3306/events_app`
- `NEXT_PUBLIC_ALLOWED_EMAILS` — Comma-separated list of emails for the stock “Purchased by” dropdown (first two are used). Example:
  - `NEXT_PUBLIC_ALLOWED_EMAILS="alice@example.com,bob@example.com"`
- `NEXT_PUBLIC_APP_URL` — Base URL (optional for links).
- `JWT_SECRET` — Present for future auth; not used for routing in this app.

## Local Development

1) Install dependencies

```bash
npm install
```

2) Configure database

- Start MySQL and create a database.
- Set `DATABASE_URL` in `.env`.

3) Prisma (optional but recommended)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

If you already have the tables (e.g., created manually), you can skip migration. The app will still work using raw SQL fallbacks.

4) Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Production Build

```bash
npm run build
npm run start
```

## UI Notes

- Navbar icons are inline SVGs with a hover tooltip and a subtle scale-up on hover.
- Active page is highlighted with a small underline bar and color.
- Logout is an icon button; turns red on hover.

## Troubleshooting

- Prisma client errors
  - Run `npx prisma generate` after changing `prisma/schema.prisma`.
  - Ensure `DATABASE_URL` is reachable.
- MySQL connection refused
  - Verify MySQL is running and credentials in `.env` are correct.
- Filters not applying
  - Inputs submit via GET; ensure query params appear in the URL.

## Roadmap Ideas

- Authentication and role-based access (replace localStorage email placeholder).
- Edit stock/ledger entries; export CSV.
- More dashboards and charts.
- i18n (Bulgarian/English switch) across UI.
