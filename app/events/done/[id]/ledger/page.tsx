import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import LedgerForm from "@/components/LedgerForm";

export const dynamic = "force-dynamic";

async function getData(id: bigint) {
  const event = await prisma.event.findUnique({ where: { id } });
  let entries: any[] = [];
  const anyPrisma: any = prisma as any;
  if (anyPrisma?.eventLedger?.findMany) {
    entries = await anyPrisma.eventLedger.findMany({ where: { event_id: id }, orderBy: { entry_date: "desc" } });
  } else {
    // Fallback for when the Prisma client hasn't been regenerated yet
    entries = await (prisma as any).$queryRaw`SELECT id, event_id, entry_type, category, description, amount, currency, entry_date, payment_method, counterparty, created_at, updated_at FROM event_ledger WHERE event_id = ${id} ORDER BY entry_date DESC`;
  }
  return { event, entries } as any;
}

export default async function LedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bid = BigInt(id);
  const { event, entries } = await getData(bid);
  const toNum = (v: any) => Number((v?.toString?.() ?? v) ?? 0);
  const incomeTotal = entries.reduce((s: number, x: any) => s + (x.entry_type === 'income' ? toNum(x.amount) : 0), 0);
  const expenseTotal = entries.reduce((s: number, x: any) => s + (x.entry_type === 'expense' ? toNum(x.amount) : 0), 0);
  const netTotal = incomeTotal - expenseTotal;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-white relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.200)_1px,transparent_1px)] [background-size:24px_24px] opacity-[.35]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-10">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Ledger · {event?.name ?? 'Event'}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">Income & Expense</h1>
            <p className="mt-1 text-slate-500 text-sm">Event ID: {id}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/events/done" className="text-sm text-slate-600 underline hover:text-slate-800">Back to done</a>
            <a href="/events" className="text-sm text-slate-600 underline hover:text-slate-800">Upcoming</a>
          </div>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur p-4">
          <h2 className="text-base font-semibold text-slate-800">Add entry</h2>
          <div className="mt-3">
            <LedgerForm eventId={id} />
          </div>
        </div>

        <div className="h-4" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
            Income
            <div className="text-lg font-semibold">{incomeTotal.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
            Expense
            <div className="text-lg font-semibold">{expenseTotal.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700">
            Net
            <div className="text-lg font-semibold">{netTotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="h-6" />

        <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Date</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Type</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Category</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Description</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Amount</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Currency</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Payment</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Counterparty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {entries.map((x: any) => {
                  const amt = x?.amount;
                  const amountStr = amt == null
                    ? '-'
                    : (typeof amt === 'object' && typeof amt.toString === 'function')
                      ? amt.toString()
                      : String(amt);
                  return (
                    <tr key={String(x.id)} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.entry_date ? format(new Date(x.entry_date), 'dd MMM yyyy') : '-'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.entry_type}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.category ?? '-'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.description ?? '-'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{amountStr}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.currency}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.payment_method ?? '-'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.counterparty ?? '-'}</td>
                    </tr>
                  );
                })}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No ledger entries yet.</td>
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
