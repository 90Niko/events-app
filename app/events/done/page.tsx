import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import BackLink from "@/components/BackLink";

export const dynamic = "force-dynamic";

async function getDoneEvents({ start, end }: { start?: string; end?: string }) {
  const rows = await prisma.event.findMany({
    where: { status: "done" },
    orderBy: { id: "desc" },
  });
  const anyPrisma: any = prisma as any;
  const enriched = await Promise.all(
    rows.map(async (e: any) => {
      let income = 0;
      let expense = 0;
      // Parse date range if provided
      const gte = start ? new Date(start) : undefined;
      const lte = end ? new Date(end) : undefined;
      if (anyPrisma?.eventLedger?.aggregate) {
        const inc = await anyPrisma.eventLedger.aggregate({
          where: {
            event_id: e.id,
            entry_type: 'income',
            ...(gte || lte ? { entry_date: { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) } } : {}),
          },
          _sum: { amount: true },
        });
        const exp = await anyPrisma.eventLedger.aggregate({
          where: {
            event_id: e.id,
            entry_type: 'expense',
            ...(gte || lte ? { entry_date: { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) } } : {}),
          },
          _sum: { amount: true },
        });
        income = Number(inc?._sum?.amount ?? 0);
        expense = Number(exp?._sum?.amount ?? 0);
      } else {
        // fallback raw sums
        let incRows: any[] = [];
        let expRows: any[] = [];
        if (start && end) {
          incRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'income' AND entry_date BETWEEN ${new Date(start)} AND ${new Date(end)}`;
          expRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'expense' AND entry_date BETWEEN ${new Date(start)} AND ${new Date(end)}`;
        } else if (start) {
          incRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'income' AND entry_date >= ${new Date(start)}`;
          expRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'expense' AND entry_date >= ${new Date(start)}`;
        } else if (end) {
          incRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'income' AND entry_date <= ${new Date(end)}`;
          expRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'expense' AND entry_date <= ${new Date(end)}`;
        } else {
          incRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'income'`;
          expRows = await anyPrisma.$queryRaw`SELECT COALESCE(SUM(amount),0) AS total FROM event_ledger WHERE event_id = ${e.id} AND entry_type = 'expense'`;
        }
        const inc = incRows?.[0];
        const exp = expRows?.[0];
        income = Number((inc?.total ?? 0).toString?.() ?? inc?.total ?? 0);
        expense = Number((exp?.total ?? 0).toString?.() ?? exp?.total ?? 0);
      }
      return { ...e, __income: income, __expense: expense };
    })
  );
  return enriched as any[];
}

export default async function DoneEventsPage({ searchParams }: { searchParams: Promise<{ start?: string; end?: string }> }) {
  const sp = await searchParams;
  const start = typeof sp?.start === 'string' ? sp.start : '';
  const end = typeof sp?.end === 'string' ? sp.end : '';
  const events = await getDoneEvents({ start, end });
  const totalIncome = events.reduce((s, e: any) => s + (typeof e.__income === 'number' ? e.__income : 0), 0);
  const totalExpense = events.reduce((s, e: any) => s + (typeof e.__expense === 'number' ? e.__expense : 0), 0);

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

        <form className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur md:grid-cols-5" method="get">
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
          <div className="md:col-span-2 flex items-end gap-3 text-sm">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">Income: <span className="font-semibold">{totalIncome.toFixed(2)}</span></div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">Expense: <span className="font-semibold">{totalExpense.toFixed(2)}</span></div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700">Net: <span className="font-semibold">{(totalIncome - totalExpense).toFixed(2)}</span></div>
          </div>
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
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{typeof e.__income === 'number' ? e.__income.toFixed(2) : '-'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{typeof e.__expense === 'number' ? e.__expense.toFixed(2) : '-'}</td>
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
