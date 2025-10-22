import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import AddExpenseForm from "@/components/AddExpenseForm";

export const dynamic = "force-dynamic";

type Search = { [k: string]: string | string[] | undefined };

function toNum(v: any) {
  return Number((v?.toString?.() ?? v) ?? 0);
}

async function getExpenses(filters: { start?: string; end?: string; category?: string }) {
  const anyPrisma: any = prisma as any;

  const { start, end, category } = filters;
  const gte = start ? new Date(start) : undefined;
  const lte = end ? new Date(end) : undefined;

  if (anyPrisma?.eventLedger?.findMany) {
    const where: any = { entry_type: "expense" };
    if (gte || lte) where.entry_date = { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
    if (category) where.category = { contains: category, mode: "insensitive" };
    const entries = await anyPrisma.eventLedger.findMany({
      where,
      include: { event: { select: { name: true } } },
      orderBy: { entry_date: "desc" },
    });
    return entries as any[];
  }

  // Fallback raw SQL join using parameterized template queries
  if (start && end && category) {
    const rows = await anyPrisma.$queryRaw`
      SELECT el.id, el.event_id, el.entry_type, el.category, el.description, el.amount, el.currency, el.entry_date, el.payment_method, el.counterparty, e.name AS event_name
      FROM event_ledger el
      JOIN events e ON e.id = el.event_id
      WHERE el.entry_type = 'expense'
        AND el.entry_date BETWEEN ${new Date(start)} AND ${new Date(end)}
        AND el.category LIKE ${"%" + category + "%"}
      ORDER BY el.entry_date DESC`;
    return rows as any[];
  }
  if (start && end) {
    const rows = await anyPrisma.$queryRaw`
      SELECT el.id, el.event_id, el.entry_type, el.category, el.description, el.amount, el.currency, el.entry_date, el.payment_method, el.counterparty, e.name AS event_name
      FROM event_ledger el
      JOIN events e ON e.id = el.event_id
      WHERE el.entry_type = 'expense'
        AND el.entry_date BETWEEN ${new Date(start)} AND ${new Date(end)}
      ORDER BY el.entry_date DESC`;
    return rows as any[];
  }
  if (start && category) {
    const rows = await anyPrisma.$queryRaw`
      SELECT el.id, el.event_id, el.entry_type, el.category, el.description, el.amount, el.currency, el.entry_date, el.payment_method, el.counterparty, e.name AS event_name
      FROM event_ledger el
      JOIN events e ON e.id = el.event_id
      WHERE el.entry_type = 'expense'
        AND el.entry_date >= ${new Date(start)}
        AND el.category LIKE ${"%" + category + "%"}
      ORDER BY el.entry_date DESC`;
    return rows as any[];
  }
  if (end && category) {
    const rows = await anyPrisma.$queryRaw`
      SELECT el.id, el.event_id, el.entry_type, el.category, el.description, el.amount, el.currency, el.entry_date, el.payment_method, el.counterparty, e.name AS event_name
      FROM event_ledger el
      JOIN events e ON e.id = el.event_id
      WHERE el.entry_type = 'expense'
        AND el.entry_date <= ${new Date(end)}
        AND el.category LIKE ${"%" + category + "%"}
      ORDER BY el.entry_date DESC`;
    return rows as any[];
  }
  if (start) {
    const rows = await anyPrisma.$queryRaw`
      SELECT el.id, el.event_id, el.entry_type, el.category, el.description, el.amount, el.currency, el.entry_date, el.payment_method, el.counterparty, e.name AS event_name
      FROM event_ledger el
      JOIN events e ON e.id = el.event_id
      WHERE el.entry_type = 'expense'
        AND el.entry_date >= ${new Date(start)}
      ORDER BY el.entry_date DESC`;
    return rows as any[];
  }
  if (end) {
    const rows = await anyPrisma.$queryRaw`
      SELECT el.id, el.event_id, el.entry_type, el.category, el.description, el.amount, el.currency, el.entry_date, el.payment_method, el.counterparty, e.name AS event_name
      FROM event_ledger el
      JOIN events e ON e.id = el.event_id
      WHERE el.entry_type = 'expense'
        AND el.entry_date <= ${new Date(end)}
      ORDER BY el.entry_date DESC`;
    return rows as any[];
  }
  if (category) {
    const rows = await anyPrisma.$queryRaw`
      SELECT el.id, el.event_id, el.entry_type, el.category, el.description, el.amount, el.currency, el.entry_date, el.payment_method, el.counterparty, e.name AS event_name
      FROM event_ledger el
      JOIN events e ON e.id = el.event_id
      WHERE el.entry_type = 'expense'
        AND el.category LIKE ${"%" + category + "%"}
      ORDER BY el.entry_date DESC`;
    return rows as any[];
  }
  const rows = await anyPrisma.$queryRaw`
    SELECT el.id, el.event_id, el.entry_type, el.category, el.description, el.amount, el.currency, el.entry_date, el.payment_method, el.counterparty, e.name AS event_name
    FROM event_ledger el
    JOIN events e ON e.id = el.event_id
    WHERE el.entry_type = 'expense'
    ORDER BY el.entry_date DESC`;
  return rows as any[];
}

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const start = typeof sp?.start === "string" ? sp.start : "";
  const end = typeof sp?.end === "string" ? sp.end : "";
  const category = typeof sp?.category === "string" ? sp.category : "";
  const entries = await getExpenses({ start, end, category });
  // Prepare events list for adding new expenses
  const events = await prisma.event.findMany({ select: { id: true, name: true }, orderBy: { id: "desc" } });
  const eventOpts = events.map((e: any) => ({ id: String(e.id), name: e.name || `#${String(e.id)}` }));

  const total = entries.reduce((s, x: any) => s + toNum(x.amount), 0);
  const byCategory = entries.reduce((acc: Record<string, number>, x: any) => {
    const key = x.category ?? "(uncategorized)";
    acc[key] = (acc[key] ?? 0) + toNum(x.amount);
    return acc;
  }, {});

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-white relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.200)_1px,transparent_1px)] [background-size:24px_24px] opacity-[.35]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-10">
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                Expenses
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">Company expenses</h1>
              <p className="mt-1 text-slate-500 text-sm">Listing {entries.length} entr{entries.length === 1 ? "y" : "ies"}.</p>
            </div>
            <div className="text-sm text-slate-700">
              Total: <span className="font-semibold">{total.toFixed(2)}</span>
            </div>
          </div>

          <form className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur md:grid-cols-5" method="get">
            <div>
              <label htmlFor="start" className="text-xs font-medium text-slate-600">Start date</label>
              <input id="start" name="start" type="date" defaultValue={start} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm" />
            </div>
            <div>
              <label htmlFor="end" className="text-xs font-medium text-slate-600">End date</label>
              <input id="end" name="end" type="date" defaultValue={end} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm" />
            </div>
            <div>
              <label htmlFor="category" className="text-xs font-medium text-slate-600">Category</label>
              <input id="category" name="category" defaultValue={category} placeholder="fuel, consumables, rent..." className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary">Filter</button>
              <a href="/expenses" className="btn-outline">Clear</a>
            </div>
            <div className="md:col-span-2 flex flex-wrap items-end gap-2 text-sm">
              {Object.entries(byCategory).map(([k, v]) => (
                <span key={k} className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5">{k}: <span className="font-medium">{v.toFixed(2)}</span></span>
              ))}
            </div>
          </form>
        </header>

        <div className="card p-4 mb-6">
          <h2 className="text-base font-semibold text-slate-800">Add expense</h2>
          <div className="mt-3">
            <AddExpenseForm events={eventOpts} />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Date</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Event</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Category</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Description</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Amount</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Currency</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Payment</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Counterparty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {entries.map((x: any) => (
                  <tr key={String(x.id)} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.entry_date ? format(new Date(x.entry_date), 'dd MMM yyyy') : '-'}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.event?.name ?? x.event_name ?? '-'}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.category ?? '-'}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.description ?? '-'}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{toNum(x.amount).toFixed(2)}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.currency ?? '-'}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.payment_method ?? '-'}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.counterparty ?? '-'}</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No expenses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
