import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import BackLink from "@/components/BackLink";

export const dynamic = "force-dynamic";

function parseDateParam(v?: string): Date | null {
  if (!v) return null;
  const t = String(v).trim();
  if (!t) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const [y, m, d] = t.split("-").map((x) => Number(x));
    return new Date(y, (m || 1) - 1, d || 1);
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(t)) {
    const [d, m, y] = t.split("/").map((x) => Number(x));
    return new Date(y, (m || 1) - 1, d || 1);
  }
  const dt = new Date(t);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

async function getDoneEvents({ start, end }: { start?: string; end?: string }) {
  const rows = await prisma.event.findMany({
    where: { status: "done" },
    orderBy: { id: "desc" },
  });
  // Filter events by date range if provided: include events whose
  // [event_start .. event_end] overlaps with [start .. end]
  const startDate = parseDateParam(start);
  const endDate = end ? endOfDay(parseDateParam(end) as Date) : null;
  const filteredRows = rows.filter((e: any) => {
    if (!startDate && !endDate) return true;
    const eventStart: Date | null = e?.event_date ? new Date(e.event_date) : null;
    // Prefer explicit end date if present; otherwise fall back to event start
    const eventEnd: Date | null = (e as any)?.end_date ? new Date((e as any).end_date) : (eventStart ?? null);
    if (!eventStart && !eventEnd) return false;
    const s = eventStart ?? eventEnd!;
    const t = eventEnd ?? eventStart!;
    if (startDate && endDate) return t >= startDate && s <= endDate; // overlap
    if (startDate) return (t ?? s) >= startDate;
    if (endDate) return (s ?? t) <= endDate;
    return true;
  });
  const anyPrisma: any = prisma as any;
  const enriched = await Promise.all(
    filteredRows.map(async (e: any) => {
      let income = 0;
      let expense = 0;
      let salary = 0;
      let stock = 0;
      // Compute totals for the whole event (not filtered by date)
      if (anyPrisma?.eventLedger?.aggregate) {
        const inc = await anyPrisma.eventLedger.aggregate({
          where: { event_id: e.id, entry_type: 'income' },
          _sum: { amount: true },
        });
        const exp = await anyPrisma.eventLedger.aggregate({
          where: { event_id: e.id, entry_type: 'expense', NOT: { category: { in: ['Salary', 'Stock'] } } },
          _sum: { amount: true },
        });
        const stockAgg = await anyPrisma.eventLedger.aggregate({
          where: { event_id: e.id, entry_type: 'expense', category: 'Stock' },
          _sum: { amount: true },
        });
        // Salary = explicit salaries + expenses categorized as Salary
        try {
          const sal = await anyPrisma.eventLedger.aggregate({
            where: { event_id: e.id, entry_type: 'salary' as any },
            _sum: { amount: true },
          });
          const toNum = (v: any) => Number((v?.toString?.() ?? v) ?? 0);
          salary += Number((sal?._sum?.amount as any)?.toString?.() ?? sal?._sum?.amount ?? 0);
        } catch {}
        const salExp = await anyPrisma.eventLedger.aggregate({
          where: { event_id: e.id, entry_type: 'expense', category: 'Salary' },
          _sum: { amount: true },
        });
        salary += Number((salExp?._sum?.amount as any)?.toString?.() ?? salExp?._sum?.amount ?? 0);
        const toNum = (v: any) => Number((v?.toString?.() ?? v) ?? 0);
        income = toNum(inc?._sum?.amount);
        expense = toNum(exp?._sum?.amount);
        stock = toNum(stockAgg?._sum?.amount);
      } else {
        // fallback raw sums
        let incRows: any[] = [];
        let expRows: any[] = [];
        let salRows1: any[] = [];
        let salRows2: any[] = [];
        let stockRows: any[] = [];
        incRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'income'`;
        expRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'expense' AND (category IS NULL OR category NOT IN ('Salary','Stock'))`;
        salRows1 = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'salary'`;
        salRows2 = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'expense' AND category = 'Salary'`;
        stockRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'expense' AND category = 'Stock'`;
        const inc = incRows?.[0];
        const exp = expRows?.[0];
        const sal1 = salRows1?.[0];
        const sal2 = salRows2?.[0];
        const stk = stockRows?.[0];
        income = Number((inc?.total ?? 0).toString?.() ?? inc?.total ?? 0);
        expense = Number((exp?.total ?? 0).toString?.() ?? exp?.total ?? 0);
        salary = Number((sal1?.total ?? 0).toString?.() ?? sal1?.total ?? 0) + Number((sal2?.total ?? 0).toString?.() ?? sal2?.total ?? 0);
        stock = Number((stk?.total ?? 0).toString?.() ?? stk?.total ?? 0);
      }
      return { ...e, __income: income, __expense: expense, __salary: salary, __stock: stock };
    })
  );
  return enriched as any[];
}

async function getGlobalExpenseTotalExclSalary() {
  const anyPrisma: any = prisma as any;
  if (anyPrisma?.eventLedger?.aggregate) {
    const agg = await anyPrisma.eventLedger.aggregate({
      where: { entry_type: 'expense', NOT: { category: { in: ['Salary','Stock'] } } },
      _sum: { amount: true },
    });
    const v = (agg?._sum?.amount as any);
    return Number(v?.toString?.() ?? v ?? 0);
  }
  const rows: any[] = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE entry_type = 'expense' AND (category IS NULL OR category NOT IN ('Salary','Stock'))`;
  const t = Array.isArray(rows) ? (rows[0]?.total ?? 0) : (rows as any)?.total ?? 0;
  return Number((t as any)?.toString?.() ?? t ?? 0);
}

async function getGlobalStockExpenseTotal() {
  const anyPrisma: any = prisma as any;
  if (anyPrisma?.eventLedger?.aggregate) {
    const agg = await anyPrisma.eventLedger.aggregate({
      where: { entry_type: 'expense', category: 'Stock' },
      _sum: { amount: true },
    });
    const v = (agg?._sum?.amount as any);
    return Number(v?.toString?.() ?? v ?? 0);
  }
  const rows: any[] = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE entry_type = 'expense' AND category = 'Stock'`;
  const t = Array.isArray(rows) ? (rows[0]?.total ?? 0) : (rows as any)?.total ?? 0;
  return Number((t as any)?.toString?.() ?? t ?? 0);
}

export default async function DoneEventsPage({ searchParams }: { searchParams: Promise<{ start?: string; end?: string }> }) {
  const sp = await searchParams;
  const start = typeof sp?.start === 'string' ? sp.start : '';
  const end = typeof sp?.end === 'string' ? sp.end : '';
  const events = await getDoneEvents({ start, end });
  // Totals for the currently filtered list (used inside filter summary)
  const totalIncome = events.reduce((s, e: any) => s + (typeof e.__income === 'number' ? e.__income : 0), 0);
  const totalExpense = events.reduce((s, e: any) => s + (typeof e.__expense === 'number' ? e.__expense : 0), 0);
  const totalSalary = events.reduce((s, e: any) => s + (typeof (e as any).__salary === 'number' ? (e as any).__salary : 0), 0);
  // Global totals (do not change with filter), shown at the top bar
  const allEvents = await getDoneEvents({});
  const allTotalIncome = allEvents.reduce((s, e: any) => s + (typeof e.__income === 'number' ? e.__income : 0), 0);
  const allTotalExpense = allEvents.reduce((s, e: any) => s + (typeof e.__expense === 'number' ? e.__expense : 0), 0);
  const allTotalSalary = allEvents.reduce((s, e: any) => s + (typeof (e as any).__salary === 'number' ? (e as any).__salary : 0), 0);
  const allTotalStock = allEvents.reduce((s, e: any) => s + (typeof (e as any).__stock === 'number' ? (e as any).__stock : 0), 0);

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
                Done events
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">Completed events</h1>
              <p className="mt-1 text-slate-500 text-sm">Listing {events.length} entr{events.length === 1 ? "y" : "ies"}.</p>
            </div>
            <div className="flex items-center gap-2">
              <BackLink />
            </div>
          </div>
        </header>

        <div className="mb-4 flex flex-wrap items-end gap-3 text-sm">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">Income: <span className="font-semibold">{allTotalIncome.toFixed(2)} EUR</span></div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">Expense: <span className="font-semibold">{allTotalExpense.toFixed(2)} EUR</span></div>
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sky-700">Salary: <span className="font-semibold">{allTotalSalary.toFixed(2)} EUR</span></div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-700">Stock: <span className="font-semibold">{allTotalStock.toFixed(2)} EUR</span></div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700">Net: <span className="font-semibold">{(allTotalIncome - allTotalExpense - allTotalSalary - allTotalStock).toFixed(2)} EUR</span></div>
        </div>

        <form className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur md:grid-cols-3" method="get">
          <div>
            <label htmlFor="start" className="text-xs font-medium text-slate-600">Start date</label>
            <input id="start" name="start" type="date" defaultValue={start} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm" />
          </div>
          <div>
            <label htmlFor="end" className="text-xs font-medium text-slate-600">End date</label>
            <input id="end" name="end" type="date" defaultValue={end} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm" />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary">Filter</button>
            <a href="/events/done" className="btn-outline">Clear</a>
          </div>
          { (start || end) ? (
            <>
              <div className="md:col-span-3 flex flex-wrap items-end gap-3 text-sm">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">Income: <span className="font-semibold">{totalIncome.toFixed(2)} EUR</span></div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">Expense: <span className="font-semibold">{totalExpense.toFixed(2)} EUR</span></div>
              </div>
              <div className="md:col-span-3 text-xs text-slate-500 italic">
                Period: {start ? start : 'All'} to {end ? end : 'All'}
              </div>
            </>
          ) : null }
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Name</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">When</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">City</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Income</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Expense</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Link</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {events.map((e: any) => {
                  const eventDate = e.event_date ? new Date(e.event_date) : null;
                  const startTime = e.start_time ? new Date(e.start_time) : null;
                  const endDate = e.end_date ? new Date(e.end_date) : null;
                  const deadline = e.reservation_deadline_date ? new Date(e.reservation_deadline_date) : null;

                  const startPart = eventDate
                    ? `${format(eventDate, "dd MMM yyyy")}${startTime ? ` ${format(startTime, "HH:mm")}` : ""}`
                    : startTime
                    ? format(startTime, "HH:mm")
                    : "-";
                  const endPart = endDate ? format(endDate, "dd MMM yyyy") : "";
                  const whenStr = endPart ? `${startPart} - ${endPart}` : startPart;

                  const rawUrl = (e.url_address ?? e.url_adress ?? "").toString().trim();
                  const href = rawUrl
                    ? (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`)
                    : "";

                  return (
                    <tr key={String(e.id ?? `${e.name}-${e.owner}-${e.event_date ?? Math.random()}`)} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 sm:px-4 sm:py-3 font-medium text-slate-800">{e.name ?? "-"}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{whenStr}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{e.city ?? "-"}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{typeof e.__income === 'number' ? `${e.__income.toFixed(2)} EUR` : '-'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{typeof e.__expense === 'number' ? `${e.__expense.toFixed(2)} EUR` : '-'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        {href ? (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-700 hover:bg-slate-50" title={href}>
                            Open
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        {e.id != null ? (
                          <a href={`/events/done/${e.id}/ledger`} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-700 hover:bg-slate-50">Manage</a>
                        ) : null}
                      </td>
                </tr>
              );
            })}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No done events.</td>
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
