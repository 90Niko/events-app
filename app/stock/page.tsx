import AddStockForm from "@/components/AddStockForm";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

type Search = { [k: string]: string | string[] | undefined };

function toNum(v: any) {
  return Number((v?.toString?.() ?? v) ?? 0);
}

async function getStockEntries(filters: { start?: string; end?: string; purchased_by?: string; payment_method?: string; q?: string }) {
  const anyPrisma: any = prisma as any;
  const { start, end, purchased_by, payment_method, q } = filters;
  const gte = start ? new Date(start) : undefined;
  const lte = end ? new Date(end) : undefined;

  if (anyPrisma?.stock?.findMany) {
    const where: any = {};
    if (gte || lte) where.purchase_date = { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
    if (purchased_by) where.purchased_by = purchased_by;
    if (payment_method) where.payment_method = payment_method;
    if (q) where.description = { contains: q, mode: "insensitive" };
    const rows = await anyPrisma.stock.findMany({ where, orderBy: { id: "desc" } });
    return rows as any[];
  }

  // Fallback raw SQL
  const conditions: string[] = [];
  const params: any[] = [];
  if (gte) { conditions.push("purchase_date >= ?"); params.push(gte); }
  if (lte) { conditions.push("purchase_date <= ?"); params.push(lte); }
  if (purchased_by) { conditions.push("purchased_by = ?"); params.push(purchased_by); }
  if (payment_method) { conditions.push("payment_method = ?"); params.push(payment_method); }
  if (q) { conditions.push("description LIKE ?"); params.push(`%${q}%`); }
  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT id, price_per_kg, weight_kg, purchase_date, description, purchased_by, payment_method, created_at, updated_at FROM stock ${whereSql} ORDER BY id DESC` as any;
  const rows = await anyPrisma.$queryRawUnsafe(sql, ...params);
  return rows as any[];
}

export default async function StockPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const start = typeof sp?.start === "string" ? sp.start : "";
  const end = typeof sp?.end === "string" ? sp.end : "";
  const purchased_by = typeof sp?.purchased_by === "string" ? sp.purchased_by : "";
  const payment_method = typeof sp?.payment_method === "string" ? sp.payment_method : "";
  const q = typeof sp?.q === "string" ? sp.q : "";
  const highlightId = typeof sp?.new === "string" ? sp.new : "";
  const envUsers = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean);
  const users = envUsers.length >= 2 ? envUsers.slice(0, 2) : envUsers.length === 1 ? [envUsers[0], "User 2"] : ["User 1", "User 2"];
  const entries = await getStockEntries({ start, end, purchased_by, payment_method, q });
  const totalWeight = entries.reduce((s: number, x: any) => s + toNum(x.weight_kg), 0);
  const totalCost = entries.reduce((s: number, x: any) => s + toNum(x.price_per_kg) * toNum(x.weight_kg), 0);

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
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Stock
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">Add Stock</h1>
              {highlightId ? (
                <p className="mt-1 text-slate-500 text-sm">Successfully saved record #{highlightId}</p>
              ) : (
                <p className="mt-1 text-slate-500 text-sm">Fill the form to add a new stock entry.</p>
              )}
            </div>
            <div className="flex items-center gap-3" />
          </div>
        </header>

        <div className="card p-4">
          <h2 className="text-base font-semibold text-slate-800">New Stock</h2>
          <div className="mt-3">
            <AddStockForm users={users} />
          </div>
        </div>

        <div className="h-4" />

        <div className="card p-4 mb-6">
          <h2 className="text-base font-semibold text-slate-800">Filter & search</h2>
          <form className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6" method="get">
            <div>
              <label htmlFor="start" className="text-xs font-medium text-slate-600">Start date</label>
              <input id="start" name="start" type="date" defaultValue={start} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm" />
            </div>
            <div>
              <label htmlFor="end" className="text-xs font-medium text-slate-600">End date</label>
              <input id="end" name="end" type="date" defaultValue={end} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm" />
            </div>
            <div>
              <label htmlFor="purchased_by" className="text-xs font-medium text-slate-600">Purchased by</label>
              <select id="purchased_by" name="purchased_by" defaultValue={purchased_by} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">All</option>
                {users.map(u => (<option key={u} value={u}>{u}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="payment_method" className="text-xs font-medium text-slate-600">Payment</label>
              <select id="payment_method" name="payment_method" defaultValue={payment_method} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">All</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank transfer</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="q" className="text-xs font-medium text-slate-600">Search</label>
              <input id="q" name="q" placeholder="description contains…" defaultValue={q} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm" />
            </div>
            <div className="md:col-span-6 flex items-end gap-2">
              <button type="submit" className="btn-primary">Filter</button>
              <a href="/stock" className="btn-outline">Clear</a>
              <div className="ml-auto text-sm text-slate-700">Total weight: <span className="font-medium">{totalWeight.toFixed(3)} kg</span>, Total cost: <span className="font-medium">{totalCost.toFixed(2)} EUR</span></div>
            </div>
          </form>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Date</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Purchased by</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Payment</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Price/kg (EUR)</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Weight (kg)</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Total (EUR)</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {entries.map((x: any) => {
                  const total = toNum(x.price_per_kg) * toNum(x.weight_kg);
                  const isNew = highlightId && String(x.id ?? "") === String(highlightId);
                  return (
                    <tr key={String(x.id)} className={`hover:bg-slate-50/60 ${isNew ? "bg-emerald-50 ring-2 ring-emerald-300" : ""}`}>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.purchase_date ? format(new Date(x.purchase_date), 'dd MMM yyyy') : '-'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.purchased_by ?? '-'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.payment_method ?? '-'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{toNum(x.price_per_kg).toFixed(2)}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{toNum(x.weight_kg).toFixed(3)}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{total.toFixed(2)}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{x.description ?? '-'}</td>
                    </tr>
                  );
                })}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No stock found.</td>
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
